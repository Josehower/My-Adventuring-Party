const expeditionGrowt = [
  {
    name: 'Warrior',
    set: {
      pd: {
        rare_increment: 1,
        uncommon_increment: 1,
        common_increment: 0,
        allways_increment: 0,
      },
      sd: {
        rare_increment: 1,
        uncommon_increment: 1,
        common_increment: 0,
        allways_increment: 0,
      },
      ap: {
        rare_increment: 8,
        uncommon_increment: 5,
        common_increment: 1,
        allways_increment: 0,
      },
      ve: {
        rare_increment: 10,
        uncommon_increment: 8,
        common_increment: 5,
        allways_increment: 5,
      },
    },
  },
  {
    name: 'Mage',
    set: {
      pd: {
        rare_increment: 1,
        uncommon_increment: 0,
        common_increment: 0,
        allways_increment: 0,
      },
      sd: {
        rare_increment: 1,
        uncommon_increment: 1,
        common_increment: 0,
        allways_increment: 0,
      },
      ap: {
        rare_increment: 10,
        uncommon_increment: 8,
        common_increment: 5,
        allways_increment: 5,
      },
      ve: {
        rare_increment: 8,
        uncommon_increment: 5,
        common_increment: 1,
        allways_increment: 0,
      },
    },
  },
  {
    name: 'Gunner',
    set: {
      pd: {
        rare_increment: 1,
        uncommon_increment: 1,
        common_increment: 0,
        allways_increment: 0,
      },
      sd: {
        rare_increment: 1,
        uncommon_increment: 0,
        common_increment: 0,
        allways_increment: 0,
      },
      ap: {
        rare_increment: 10,
        uncommon_increment: 8,
        common_increment: 5,
        allways_increment: 5,
      },
      ve: {
        rare_increment: 8,
        uncommon_increment: 5,
        common_increment: 1,
        allways_increment: 0,
      },
    },
  },
  {
    name: 'Healer',
    set: {
      pd: {
        rare_increment: 2,
        uncommon_increment: 1,
        common_increment: 1,
        allways_increment: 1,
      },
      sd: {
        rare_increment: 2,
        uncommon_increment: 1,
        common_increment: 1,
        allways_increment: 1,
      },
      ap: {
        rare_increment: 10,
        uncommon_increment: 5,
        common_increment: 5,
        allways_increment: 3,
      },
      ve: {
        rare_increment: 5,
        uncommon_increment: 2,
        common_increment: 0,
        allways_increment: 0,
      },
    },
  },
];

exports.up = async (sql) => {
  await sql`
  ALTER TABLE helden_class
  ADD expedition_growth_id integer REFERENCES expedition_class_growth (expedition_growth_id);
  `;

  for (let i = 0; i < expeditionGrowt.length; i++) {
    const set = expeditionGrowt[i].set;
    const className = expeditionGrowt[i].name;

    const [{ pd_set_id: pdId }] = await sql`
  INSERT INTO pd_growth_set
  (rare_increment, uncommon_increment, common_increment, allways_increment)
  values
  (
  	${set.pd.rare_increment},
  	${set.pd.uncommon_increment},
  	${set.pd.common_increment},
  	${set.pd.allways_increment}
  	)
  returning pd_set_id`;

    const [{ sd_set_id: sdId }] = await sql`
  INSERT INTO sd_growth_set
  (rare_increment, uncommon_increment, common_increment, allways_increment)
  values
  (
  	${set.sd.rare_increment},
  	${set.sd.uncommon_increment},
  	${set.sd.common_increment},
  	${set.sd.allways_increment}
  	)
  returning sd_set_id`;

    const [{ ap_set_id: apId }] = await sql`
  INSERT INTO ap_growth_set
  (rare_increment, uncommon_increment, common_increment, allways_increment)
  values
  (
  	${set.ap.rare_increment},
  	${set.ap.uncommon_increment},
  	${set.ap.common_increment},
  	${set.ap.allways_increment}
  	)
  returning ap_set_id`;

    const [{ ve_set_id: veId }] = await sql`
  INSERT INTO ve_growth_set
  (rare_increment, uncommon_increment, common_increment, allways_increment)
  values
  (
  	${set.ve.rare_increment},
  	${set.ve.uncommon_increment},
  	${set.ve.common_increment},
  	${set.ve.allways_increment}
  	)
  returning ve_set_id`;

    const [{ expedition_growth_id: classGrowthId }] = await sql`
    INSERT INTO expedition_class_growth
    (ve_set_id, ap_set_id, sd_set_id, pd_set_id)
    values
    (
      ${veId},
      ${apId},
      ${sdId},
      ${pdId}
      )
    returning expedition_growth_id`;

    const newClass = await sql`
    UPDATE helden_class
    SET expedition_growth_id = ${classGrowthId}
    WHERE class_name = ${className}
    returning *`;
  }
};

exports.down = async (sql) => {
  await sql`
  ALTER TABLE helden_class
  DROP COLUMN expedition_growth_id;
  `;
  await sql`
  DELETE FROM pd_growth_set;
  `;
  await sql`
  DELETE FROM sd_growth_set;
  `;
  await sql`
  DELETE FROM  ve_growth_set;
  `;
  await sql`
  DELETE FROM  ap_growth_set;
  `;
  await sql`
  DELETE FROM  expedition_class_growth;
  `;
};
