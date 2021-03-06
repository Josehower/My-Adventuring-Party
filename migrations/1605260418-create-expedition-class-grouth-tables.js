exports.up = async (sql) => {
  await sql`
	CREATE TABLE IF NOT EXISTS pd_growth_set (
		pd_set_id integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
		rare_increment integer NOT NULL,
		uncommon_increment integer NOT NULL,
		common_increment integer NOT NULL,
		allways_increment integer NOT NULL
	);`;

  await sql`
	CREATE TABLE IF NOT EXISTS sd_growth_set (
		sd_set_id integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
		rare_increment integer NOT NULL,
		uncommon_increment integer NOT NULL,
		common_increment integer NOT NULL,
		allways_increment integer NOT NULL
	);`;

  await sql`
	CREATE TABLE IF NOT EXISTS ap_growth_set (
		ap_set_id integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
		rare_increment integer NOT NULL,
		uncommon_increment integer NOT NULL,
		common_increment integer NOT NULL,
		allways_increment integer NOT NULL
	);`;

  await sql`
	CREATE TABLE IF NOT EXISTS ve_growth_set (
		ve_set_id integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
		rare_increment integer NOT NULL,
		uncommon_increment integer NOT NULL,
		common_increment integer NOT NULL,
		allways_increment integer NOT NULL
	);`;

  await sql`
	CREATE TABLE IF NOT EXISTS expedition_class_growth (
		expedition_growth_id integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
		ve_set_id integer NOT NULL REFERENCES ve_growth_set (ve_set_id) ON DELETE CASCADE ON UPDATE CASCADE,
		ap_set_id integer NOT NULL REFERENCES ap_growth_set (ap_set_id) ON DELETE CASCADE ON UPDATE CASCADE,
		sd_set_id integer NOT NULL REFERENCES sd_growth_set (sd_set_id) ON DELETE CASCADE ON UPDATE CASCADE,
		pd_set_id integer NOT NULL REFERENCES pd_growth_set (pd_set_id) ON DELETE CASCADE ON UPDATE CASCADE

	);`;
};

exports.down = async (sql) => {
  await sql`
	DROP TABLE IF EXISTS pd_growth_set, sd_growth_set, ap_growth_set, ve_growth_set, expedition_class_growth;`;
};
