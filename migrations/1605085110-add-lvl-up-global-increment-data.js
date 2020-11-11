const globalIncrementByLvl = [
  {
    new_lvl: 2,
    new_total_sa: 2,
    ve_ap_increment: 5,
    def_increment: 1,
    ve_extra_increment: 0,
    turns_into_stone: false,
  },
  {
    new_lvl: 3,
    new_total_sa: 3,
    ve_ap_increment: 10,
    def_increment: 1,
    ve_extra_increment: 5,
    turns_into_stone: false,
  },
  {
    new_lvl: 4,
    new_total_sa: 3,
    ve_ap_increment: 10,
    def_increment: 1,
    ve_extra_increment: 0,
    turns_into_stone: false,
  },
  {
    new_lvl: 5,
    new_total_sa: 3,
    ve_ap_increment: 10,
    def_increment: 1,
    ve_extra_increment: 0,
    turns_into_stone: false,
  },
  {
    new_lvl: 6,
    new_total_sa: 3,
    ve_ap_increment: 10,
    def_increment: 1,
    ve_extra_increment: 0,
    turns_into_stone: false,
  },
  {
    new_lvl: 7,
    new_total_sa: 4,
    ve_ap_increment: 15,
    def_increment: 1,
    ve_extra_increment: 10,
    turns_into_stone: true,
  },
  {
    new_lvl: 8,
    new_total_sa: 4,
    ve_ap_increment: 15,
    def_increment: 1,
    ve_extra_increment: 0,
    turns_into_stone: true,
  },
  {
    new_lvl: 9,
    new_total_sa: 4,
    ve_ap_increment: 15,
    def_increment: 1,
    ve_extra_increment: 0,
    turns_into_stone: true,
  },
  {
    new_lvl: 10,
    new_total_sa: 5,
    ve_ap_increment: 20,
    def_increment: 2,
    ve_extra_increment: 20,
    turns_into_stone: true,
  },
];

exports.up = async (sql) => {
  await sql`
  INSERT INTO stats_increment_by_lvl_up ${sql(
    globalIncrementByLvl,
    'new_lvl',
    'new_total_sa',
    've_ap_increment',
    'def_increment',
    've_extra_increment',
    'turns_into_stone',
  )};
  `;
};

exports.down = async (sql) => {
  await sql`DELETE FROM stats_increment_by_lvl_up`;
};
