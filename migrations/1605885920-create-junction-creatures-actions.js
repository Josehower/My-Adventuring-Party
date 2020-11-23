const typeActions = [
  {
    creature_type_name: 'dark warrior',
    action_name: 'body onslaught',
  },
  {
    creature_type_name: 'dark mage',
    action_name: 'arcane scourge',
  },
  {
    creature_type_name: 'dark archer',
    action_name: 'accurate shot',
  },
  {
    creature_type_name: 'dark healer',
    action_name: 'supernatural healing',
  },
];

exports.up = async (sql) => {
  await sql`
	CREATE TABLE IF NOT EXISTS creature_actions_set (
		action_set_id integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
		combat_action_id integer REFERENCES combat_action (combat_action_id) ON DELETE CASCADE,
		creature_type_id integer REFERENCES creature_type (creature_type_id) ON DELETE CASCADE
	);`;

  const classActionsWithBasic = [
    ...typeActions,
    ...typeActions.map((action) => {
      const actionCopy = { ...action };
      actionCopy.action_name = 'basic attack';
      return { ...actionCopy };
    }),
  ];

  const promises = classActionsWithBasic.map(async (obj) => {
    const [creatureType] = await sql`
		SELECT action.combat_action_id, type.creature_type_id  FROM
			creature_type as type,
			combat_action as action
		WHERE
			type.creature_type_name = ${obj.creature_type_name}
		AND
			action.action_name = ${obj.action_name}
		;`;
    return creatureType;
  });

  const junctionObj = await Promise.all(promises);
  console.log(await classActionsWithBasic);

  const junctionInfo = await sql`
	INSERT INTO creature_actions_set ${sql(
    junctionObj,
    'combat_action_id',
    'creature_type_id',
  )} RETURNING *
	`;
};

exports.down = async (sql) => {
  await sql`DROP TABLE IF EXISTS creature_actions_set;`;
};
