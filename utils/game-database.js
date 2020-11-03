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
