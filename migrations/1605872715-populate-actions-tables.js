const target = [
  { target_keyword_name: 'enemy' },
  { target_keyword_name: 'party' },
  { target_keyword_name: 'all' },
];
const speed = [{ speed_name: 'tactical' }, { speed_name: 'damaging' }];
const types = [
  {
    action_type_name: 'healing',
    action_type_desc:
      'this action heal a team member, it heals equals to a multiple of the AP amount of the performer. Use a (SA) Special Action Point',
    actionSpeed: 'tactical',
  },
  {
    action_type_name: 'item',
    action_type_desc:
      'use an item on the players bag, after the action is performed the item is destroyed',
    actionSpeed: 'tactical',
  },
  {
    action_type_name: 'basic',
    action_type_desc:
      'this is the most basic form of a damaging action, it deals damage equals to the AP amount of the performer',
    actionSpeed: 'damaging',
  },
  {
    action_type_name: 'special attack',
    action_type_desc:
      'this damaging actions especific actions to the class or type of the performer, it deal damage equals to a multiple of the AP amount of the performer. Use a (SA) Apecial Action Point',
    actionSpeed: 'damaging',
  },
];
const actions = [
  {
    action_name: 'basic attack',
    action_desc: 'an atack caused by a weapon',
    effect_ref: 100,
    actionType: 'basic',
    targetKeyword: 'enemy',
  },
  {
    action_name: 'body onslaught',
    action_desc: "an raged blow caused by the warrior's bodily strength",
    effect_ref: 150,
    actionType: 'special attack',
    targetKeyword: 'enemy',
  },
  {
    action_name: 'accurate shot',
    action_desc: "an calculated shot towards the target's weak points",
    effect_ref: 200,
    actionType: 'special attack',
    targetKeyword: 'enemy',
  },
  {
    action_name: 'arcane scourge',
    action_desc: 'an energy blast, causing heavy injuries to the target',
    effect_ref: 200,
    actionType: 'special attack',
    targetKeyword: 'enemy',
  },
  {
    action_name: 'supernatural healing',
    action_desc:
      'an aura that surrounds the target and spontaneously heals their wounds',
    effect_ref: 250,
    actionType: 'healing',
    targetKeyword: 'party',
  },
];

exports.up = async (sql) => {
  const speedList = await sql`
INSERT INTO action_speed ${sql(speed, 'speed_name')} RETURNING *;`;
  const targetList = await sql`
INSERT INTO target_keyword ${sql(target, 'target_keyword_name')} RETURNING *;`;

  const typesObj = types.map((obj) => {
    const speedId = speedList.find(
      (speed) => speed.speed_name === obj.actionSpeed,
    );

    return { ...obj, action_speed_id: speedId.action_speed_id };
  });

  const typesData = await sql`
	INSERT INTO action_type ${sql(
    typesObj,
    'action_type_name',
    'action_type_desc',
    'action_speed_id',
  )} RETURNING *;`;

  const actionsObj = actions.map((obj) => {
    const typeId = typesData.find(
      (type) => type.action_type_name === obj.actionType,
    );
    const targetId = targetList.find(
      (target) => target.target_keyword_name === obj.targetKeyword,
    );
    return {
      ...obj,
      target_id: targetId.target_id,
      action_type_id: typeId.action_type_id,
    };
  });

  await sql`
	INSERT INTO combat_action ${sql(
    actionsObj,
    'action_type_id',
    'action_name',
    'action_desc',
    'effect_ref',
    'target_id',
  )} RETURNING *;`;
};

exports.down = async (sql) => {
  await sql`
DELETE FROM action_speed;`;
  await sql`
DELETE FROM target_keyword;`;
  await sql`
DELETE FROM action_type;`;
  await sql`
DELETE FROM combat_action;`;
};
