exports.up = async (sql) => {
  await sql`
	CREATE TABLE IF NOT EXISTS marios_mexican_store (
		store_id integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
		item_id integer NOT NULL REFERENCES items (item_id) ON DELETE CASCADE ON UPDATE CASCADE,
		game_id integer NOT NULL REFERENCES game_instance (game_id) ON DELETE CASCADE ON UPDATE CASCADE,
		is_locked boolean

	);`;
};

exports.down = async (sql) => {
  await sql`
	DROP TABLE IF EXISTS marios_mexican_store;
	`;
};
