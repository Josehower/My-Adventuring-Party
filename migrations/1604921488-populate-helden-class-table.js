const statsBoost = [
  {
    class_name: 'Warrior',
    ve_class_boost: 2,
    ap_class_boost: 0,
    pd_class_boost: 0,
    sd_class_boost: 0,
  },
  {
    class_name: 'Mage',
    ve_class_boost: 0,
    ap_class_boost: 2,
    pd_class_boost: 0,
    sd_class_boost: 0,
  },
  {
    class_name: 'Gunner',
    ve_class_boost: 0,
    ap_class_boost: 2,
    pd_class_boost: 0,
    sd_class_boost: 0,
  },
  {
    class_name: 'Healer',
    ve_class_boost: 0,
    ap_class_boost: 1,
    pd_class_boost: 1,
    sd_class_boost: 1,
  },
];
const baseStats = [
  {
    class_name: 'Warrior',
    ve_class_base: 80,
    ap_class_base: 10,
    pd_class_base: 15,
    sd_class_base: 15,
  },
  {
    class_name: 'Mage',
    ve_class_base: 60,
    ap_class_base: 10,
    pd_class_base: 0,
    sd_class_base: 20,
  },
  {
    class_name: 'Gunner',
    ve_class_base: 60,
    ap_class_base: 10,
    pd_class_base: 20,
    sd_class_base: 0,
  },
  {
    class_name: 'Healer',
    ve_class_base: 50,
    ap_class_base: 10,
    pd_class_base: 10,
    sd_class_base: 10,
  },
];

const Classes = [
  {
    class_name: 'Warrior',
    description:
      'This HELDEN is phisicaly stronger as any other counterparts, he is the frontline figther of the party and is the only member capable to fight on melee range.',
    damage_nature: 'Physical',
    battle_position: 'Melee',
    class_image: '/warrior.png',
  },
  {
    class_name: 'Mage',
    description:
      'This HELDEN use the magical energy that emanates from this new world. You have to worry about the amount of magic damage it can cause when covered by an ally.',
    damage_nature: 'Supernatural',
    battle_position: 'Range',
    class_image: '/mage.png',
  },
  {
    class_name: 'Gunner',
    description:
      'This HELDEN is faster and more agile than any other counterpart, he is able to use long distance weapons and pistols to cause a lot of physical damage to his opponents.',
    damage_nature: 'Physical',
    battle_position: 'Range',
    class_image: '/gunner.png',
  },
  {
    class_name: 'Healer',
    description:
      'This HELDEN is not capable of killing anyone by himself, however he has the unique ability to heal and this is something that will mark the difference in battle.',
    damage_nature: 'Supernatural',
    battle_position: 'Range',
    class_image: '/healer.png',
  },
];

exports.up = async (sql) => {
  const class_stats_id = await sql`
	INSERT INTO class_stats_on_lvl_1 ${sql(
    baseStats,
    've_class_base',
    'ap_class_base',
    'sd_class_base',
    'pd_class_base',
  )} RETURNING class_stats_id;
	`;

  const stat_boost_id = await sql`
  INSERT INTO class_boost_stats_on_levelup ${sql(
    statsBoost,
    've_class_boost',
    'ap_class_boost',
    'sd_class_boost',
    'pd_class_boost',
  )} RETURNING stat_boost_id;
  `;

  const classObj = Classes.map((classObj, index) => {
    return {
      ...classObj,
      class_stats_id: class_stats_id[index].class_stats_id,
      stat_boost_id: stat_boost_id[index].stat_boost_id,
    };
  });

  const classes = await sql`
  INSERT INTO helden_class ${sql(
    classObj,
    'class_name',
    'description',
    'damage_nature',
    'battle_position',
    'class_image',
    'stat_boost_id',
    'class_stats_id',
  )} RETURNING *;
	`;
};

exports.down = async (sql) => {
  // just in case...
  await sql`DELETE FROM helden_class`;
  await sql`DELETE FROM class_boost_stats_on_levelup`;
  await sql`DELETE FROM class_stats_on_lvl_1`;
};
