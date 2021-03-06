exports.up = async (sql) => {
  await sql`
	CREATE TABLE IF NOT EXISTS player_purse (
		purse_id integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
		gold integer NOT NULL DEFAULT 0,
		soul_stones integer NOT NULL DEFAULT 4
	);`;

  await sql`
	CREATE TABLE IF NOT EXISTS coin_barrel (
		barrel_id integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
		last_hit TIMESTAMP NOT NULL DEFAULT NOW()
	);`;

  await sql`
	CREATE TABLE IF NOT EXISTS game_instance (
		game_id integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
		purse_id integer NOT NULL REFERENCES player_purse (purse_id) ON DELETE CASCADE ON UPDATE CASCADE,
		barrel_id integer NOT NULL REFERENCES coin_barrel (barrel_id) ON DELETE CASCADE ON UPDATE CASCADE
	);`;

  await sql`ALTER TABLE players
		ADD COLUMN game_id integer NOT NULL REFERENCES game_instance (game_id) ON DELETE CASCADE ON UPDATE CASCADE;`;
};

exports.down = async (sql) => {
  await sql`
    ALTER TABLE players
      DROP COLUMN game_id;
  `;
  await sql`
	DROP TABLE IF EXISTS game_instance;
	`;
  await sql`
	DROP TABLE IF EXISTS coin_barrel;
	`;
  await sql`
	DROP TABLE IF EXISTS player_purse;
	`;
};
