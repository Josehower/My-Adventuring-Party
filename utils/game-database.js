import dotenv from 'dotenv';
import camelcaseKeys from 'camelcase-keys';
import { sql } from './account-database';
import setPostgresDefaultsOnHeroku from './setPostgresDefaultsOnHeroku';

setPostgresDefaultsOnHeroku();

dotenv.config();

export async function createGameInstance() {
  const barrel = await sql`
  INSERT INTO coin_barrel DEFAULT VALUES RETURNING *;`;

  const purse = await sql`
  INSERT INTO player_purse DEFAULT VALUES RETURNING *;`;

  const barrelId = barrel[0].barrel_id;
  const purseId = purse[0].purse_id;

  const gameInstance = await sql`
    INSERT INTO game_instance
      (barrel_id, purse_id)
    VALUES
      (${barrelId}, ${purseId})
    RETURNING *;
  `;

  const itemsInventory = await sql`
  SELECT * FROM items;
  `;

  const itemsPrepared = itemsInventory.map((item) => {
    return {
      item_id: item.item_id,
      game_id: gameInstance[0].game_id,
      is_locked: item.unlock_price === null ? false : true,
    };
  });

  const newStore = await sql`
    INSERT INTO marios_mexican_store
    ${sql(itemsPrepared, 'item_id', 'game_id', 'is_locked')} RETURNING *`;

  return camelcaseKeys(gameInstance[0]);
}

export async function getPlayerMoneyById(gameId) {
  //TODO: rename to getPlayerMoneyByGameId
  const money = await sql`
    SELECT 
      players.nick_name,
      players.player_name,
      players.e_mail,
      purse.gold, 
      purse.soul_stones, 
      barrel.last_hit
    FROM game_instance as game
      JOIN player_purse as purse
        ON purse.purse_id = game.game_id
      JOIN players
        ON players.game_id = ${gameId}
      JOIN coin_barrel as barrel
        ON barrel.barrel_id = game.game_id where game.game_id = ${gameId};`;

  return camelcaseKeys(money[0]);
}

export async function getStoreByGameId(gameId) {
  const store = await sql`
  SELECT s.game_id, i.item_id, i.name, i.price, s.is_locked, i.description
    FROM marios_mexican_store as s
    JOIN items as i ON s.item_id = i.item_id
    WHERE s.game_id = ${gameId}
;`;

  return store.map((store) => camelcaseKeys(store));
}

export async function getPlayerBagByGameId(gameId) {
  const store = await sql`
  SELECT items.item_id, items.name, bag.qty, items.description
    FROM player_bag as bag
    JOIN items ON bag.item_id = items.item_id
    WHERE bag.game_id = ${gameId}
;`;

  return store.map((store) => camelcaseKeys(store));
}

export async function hitTheBarrelByGameId(GameId) {
  const [{ gold, last_hit, purse_id, barrel_id }] = await sql`
  SELECT p.gold, b.last_hit, g.purse_id, g.barrel_id
    FROM game_instance AS g
    JOIN player_purse AS p
      ON p.purse_id = g.purse_id
    JOIN coin_barrel as b
      ON b.barrel_id = g.barrel_id WHERE g.game_id = ${GameId}; `;

  const reference = new Date();

  let barrelCurrentAmount = Math.floor((+reference - last_hit) / 1000 / 5);

  if (barrelCurrentAmount > 500) {
    barrelCurrentAmount = 500;
  }

  const newGoldValue = gold + barrelCurrentAmount;
  const newHitDate = reference;

  await sql`
  UPDATE coin_barrel as b
  SET last_hit = ${newHitDate}
  WHERE b.barrel_id = ${barrel_id};
  `;

  setGoldToPurse(purse_id, newGoldValue);

  return {
    message: `You have hit the barrel and as a reward you have received ${barrelCurrentAmount} gold!.`,
  };
}

export async function getItemById(itemId) {
  const [item] = await sql`
  select * from items WHERE item_id = ${itemId}
  `;

  return camelcaseKeys(item);
}

export async function buyItemByGameId(itemId, gameId, withSoulStones = false) {
  const { gold, soulStones } = await getPlayerMoneyById(gameId);
  const { purseId } = await getPlayerPurseByGameId(gameId);

  const {
    price: goldPrice,
    soulStonesPrice,
    name: itemName,
  } = await getItemById(itemId);

  if (withSoulStones) {
    if (soulStonesPrice === null)
      return { message: "ups! you found a bug, this shouldn't have happened" };

    const newSoulStonesAmount = soulStones - soulStonesPrice;
    const areEnoughSoulStones = newSoulStonesAmount >= 0;

    if (!areEnoughSoulStones)
      return { message: 'ups! you need more SoulStones for that!' };

    // calculate new §
    // set the new § amount on db
    setSoulStonesToPurse(purseId, newSoulStonesAmount);

    // add item to bag or update qty by 1
    addItemsToBag(gameId, itemId);

    return { message: `nice! you have purchased a ${itemName} with §` };
  }
  const newGoldAmount = gold - goldPrice;
  const isEnoughGold = newGoldAmount >= 0;

  if (!isEnoughGold) return { message: 'ups! you need more Gold for that!' };

  // calculate new §
  // set the new § amount on db
  setGoldToPurse(purseId, newGoldAmount);

  // add item to bag or update qty by 1
  addItemsToBag(gameId, itemId);

  return { message: `nice! you have purchased a ${itemName} with $` };
}

async function getItemOnBag(gameId, itemId) {
  const bag = await sql`
  SELECT * FROM player_bag
  WHERE item_id = ${itemId}
  AND game_id = ${gameId} ;
  `;

  return bag.map((item) => camelcaseKeys(item))[0];
}

async function setGoldToPurse(purseId, newGoldAmount) {
  const [purse] = await sql`
  UPDATE player_purse as p
  SET gold = ${newGoldAmount}
  WHERE p.purse_id  = ${purseId} RETURNING *;
  `;

  return camelcaseKeys(purse);
}

async function setSoulStonesToPurse(purseId, newSoulStonesAmount) {
  const [purse] = await sql`
  UPDATE player_purse as p
  SET soul_stones = ${newSoulStonesAmount}
  WHERE p.purse_id  = ${purseId} RETURNING *;
  `;

  return camelcaseKeys(purse);
}

async function addItemsToBag(gameId, itemId, addQty = 1) {
  const bag = await getItemOnBag(gameId, itemId);
  if (bag) {
    const newItemOnBag = await sql`
    UPDATE player_bag
    SET  qty = ${bag.qty + addQty}
    WHERE bag_id = ${bag.bagId} RETURNING *;`;
    return newItemOnBag;
  }
  const newItemOnBag = await sql`
  INSERT INTO player_bag (item_id, game_id, qty)
  VALUES (${itemId}, ${gameId}, ${addQty})
  RETURNING *`;
  return newItemOnBag;
}

async function getPlayerPurseByGameId(gameId) {
  const [purse] = await sql`
  SELECT p.purse_id, p.gold, p.soul_stones
  FROM game_instance as g
  JOIN player_purse as p
  ON p.purse_id = g.purse_id  WHERE
  game_id = ${gameId};`;

  return camelcaseKeys(purse);
}
