import postgres from 'postgres';
import dotenv from 'dotenv';
import camelcaseKeys from 'camelcase-keys';

dotenv.config();
const sql = postgres();

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

  console.log(newStore);

  return camelcaseKeys(gameInstance[0]);
}

export async function getPlayerMoneyById(id) {
  const sizeOptions = await sql`
    SELECT players.nick_name, purse.gold, purse.soul_stones , barrel.last_hit
      FROM game_instance as game
      JOIN player_purse as purse
        ON purse.purse_id = game.game_id
      JOIN players
        ON players.game_id = ${id}
      JOIN coin_barrel as barrel
        ON barrel.barrel_id = game.game_id where game.game_id = ${id};`;

  return camelcaseKeys(sizeOptions[0]);
}

export async function getStoreByGameId(id) {
  const store = await sql`
  SELECT items.name, items.price, store.is_locked
    FROM marios_mexican_store as store
    JOIN items ON store.item_id = items.item_id
    WHERE store.game_id = ${id}
;`;

  return store.map((store) => camelcaseKeys(store));
}

export async function getPlayerBagByGameId(id) {
  const store = await sql`
  SELECT items.name, bag.qty
    FROM player_bag as bag
    JOIN items ON bag.item_id = items.item_id
    WHERE bag.game_id = ${id}
;`;

  return store.map((store) => camelcaseKeys(store));
}
