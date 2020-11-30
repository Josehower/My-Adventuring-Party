import postgres from 'postgres';
import dotenv from 'dotenv';
import camelcaseKeys from 'camelcase-keys';
import setPostgresDefaultsOnHeroku from './setPostgresDefaultsOnHeroku';

setPostgresDefaultsOnHeroku();

dotenv.config();

export let sql;

if (process.env.NODE_ENV === 'production') {
  // Heroku needs SSL connections but
  // has an "unauthorized" certificate
  // https://devcenter.heroku.com/changelog-items/852
  sql = postgres({ ssl: { rejectUnauthorized: false } });
} else {
  if (!globalThis.postgresSql) {
    globalThis.postgresSql = postgres();
  }
  sql = globalThis.postgresSql;
}

// export const sql =
//   process.env.NODE_ENV === 'production'
//     ? // Heroku needs SSL connections but
//       // has an "unauthorized" certificate
//       // https://devcenter.heroku.com/changelog-items/852
//       postgres({ ssl: { rejectUnauthorized: false } })
//     : postgres({
//         idle_timeout: 5,
//       });

export async function registerPlayer({
  playerName,
  email,
  nickname,
  pwHash,
  gameInstance,
}) {
  const user = await sql`
    INSERT INTO players
      (player_name, e_mail, nick_name, pw_hash, game_id)
    VALUES
      (${playerName}, ${email}, ${nickname}, ${pwHash}, ${gameInstance.gameId})
    RETURNING *;
  `;

  return camelcaseKeys(user[0]);
}

export async function getPlayerByName(playerName) {
  const users = await sql`
    SELECT * FROM players WHERE player_name = ${playerName};
  `;

  return users.map((u) => camelcaseKeys(u))[0];
}

export async function getSessionByToken(token) {
  const sessions = await sql`
    SELECT * FROM sessions WHERE token = ${token};
  `;
  return sessions;
}

export async function insertSession(token, playerId) {
  const sessions = await sql`
    INSERT INTO sessions
      (token, player_id)
    VALUES
      (${token}, ${playerId})
    RETURNING *;
  `;

  return sessions.map((s) => camelcaseKeys(s))[0];
}

export async function deleteExpiredSessions() {
  await sql`
    DELETE FROM sessions WHERE expiry_timestamp < NOW();
  `;
}

export async function deleteSessionByToken(token) {
  if (typeof token === 'undefined') return;
  await sql`
    DELETE FROM sessions WHERE token = ${token};
  `;
}

export async function getGameByToken(token) {
  const sessions = await sql`
  SELECT g.game_id, g.purse_id, g.barrel_id
      FROM players as p
      JOIN sessions as s
        ON s.player_id = p.player_id
      JOIN game_instance as g
        ON g.game_id = p.game_id
        where s.token = ${token};
  `;
  return camelcaseKeys(sessions[0]);
}
