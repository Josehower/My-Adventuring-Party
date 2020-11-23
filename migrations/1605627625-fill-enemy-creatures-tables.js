const creatures = [
  {
    name: 'dark warrior',
    creature_type: 'dark warrior',
    ve_vital_energy: 88,
    ap_action_power: 11,
    sd_supernatural_defense: 19,
    pd_physical_defense: 19,
    lvl_level: 1,
    sa_special_actions: 2,
  },
  {
    name: 'dark healer',
    creature_type: 'dark healer',
    ve_vital_energy: 70,
    ap_action_power: 19,
    sd_supernatural_defense: 12,
    pd_physical_defense: 12,
    lvl_level: 2,
    sa_special_actions: 2,
  },
  {
    name: 'dark archer',
    creature_type: 'dark archer',
    ve_vital_energy: 69,
    ap_action_power: 23,
    sd_supernatural_defense: 1,
    pd_physical_defense: 21,
    lvl_level: 2,
    sa_special_actions: 2,
  },
  {
    name: 'dark mage',
    creature_type: 'dark mage',
    ve_vital_energy: 60,
    ap_action_power: 13,
    sd_supernatural_defense: 20,
    pd_physical_defense: 0,
    lvl_level: 1,
    sa_special_actions: 2,
  },
];

exports.up = async (sql) => {
  for (let i = 0; i < creatures.length; i++) {
    const creatureObj = creatures[i];
    const type = creatureObj.creature_type;
    const name = creatureObj.name;

    const [{ creature_type_id: typeId }] = await sql`
		SELECT creature_type_id
			FROM creature_type
			WHERE creature_type_name = ${type}
		`;

    const [{ stats_id: statsId }] = await sql`
		INSERT INTO creature_stats_set (
			ve_vital_energy,
			ap_action_power,
			sd_supernatural_defense,
			pd_physical_defense,
			lvl_level,
			sa_special_actions
		)
		VALUES (
			${creatureObj.ve_vital_energy},
			${creatureObj.ap_action_power},
			${creatureObj.sd_supernatural_defense},
			${creatureObj.pd_physical_defense},
			${creatureObj.lvl_level},
			${creatureObj.sa_special_actions}
		)
		RETURNING *`;

    await sql`
    INSERT INTO enemy_creatures (
    	creature_type_id,
    	stats_id,
    	name
    )
    VALUES (
			${typeId},
			${statsId},
			${name}
		)`;
  }
};

exports.down = async (sql) => {
  await sql`
DELETE FROM creature_stats_set;`;
};
