exports.up = async (sql) => {
  await sql`
	CREATE TABLE IF NOT EXISTS player_bag (
		bag_id integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
		item_id integer NOT NULL REFERENCES items (item_id) ON DELETE CASCADE ON UPDATE CASCADE,
		game_id integer NOT NULL REFERENCES game_instance (game_id) ON DELETE CASCADE ON UPDATE CASCADE,
		qty int NOT NULL

	);`;
};

exports.down = async (sql) => {
  await sql`
	DROP TABLE IF EXISTS player_bag;
	`;
};
