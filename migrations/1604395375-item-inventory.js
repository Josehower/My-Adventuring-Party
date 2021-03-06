exports.up = async (sql) => {
  await sql`
	CREATE TABLE IF NOT EXISTS item_types (
		item_type_id integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
		type_name varchar(50) NOT NULL,
		description text NOT NULL
	);`;

  await sql`
	CREATE TABLE IF NOT EXISTS item_rarities (
		item_rarity_id integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
		rarity_name varchar(50) NOT NULL
	);`;

  await sql`
	CREATE TABLE IF NOT EXISTS items (
		item_id integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
		name varchar(50) NOT NULL,
		price int NOT NULL,
		soul_stones_price int,
		unlock_price int,
		description text NOT NULL,
		item_type_id integer NOT NULL REFERENCES item_types (item_type_id) ON DELETE CASCADE ON UPDATE CASCADE,
		item_rarity_id integer NOT NULL REFERENCES item_rarities (item_rarity_id) ON DELETE CASCADE ON UPDATE CASCADE
	);`;
};

exports.down = async (sql) => {
  await sql`
	DROP TABLE IF EXISTS items;
	`;
  await sql`
	DROP TABLE IF EXISTS item_types;
	`;
  await sql`
	DROP TABLE IF EXISTS item_rarities;
	`;
};
