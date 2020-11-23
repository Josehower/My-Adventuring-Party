import dotenv from 'dotenv';
import camelcaseKeys from 'camelcase-keys';
import { sql } from './account-database';
import { getHeldenListByGameId } from './helden-database';
import { testEncounter } from './encounterList';

dotenv.config();

export async function initializeCombat(gameId) {
  const heldenList = await getHeldenListByGameId(gameId);

  const partyList = heldenList
    .filter((helden) => helden.partySlot !== null)
    .sort((a, b) => a.partySlot - b.partySlot);

  if (partyList.length === 0) {
    return false;
  }

  //TODO: design how to define a winer after all  players of a party are at 0 live.
  //TODO: use apollo to make the initial call and define it from a start battle function.

  const combatInstance = await getCombatInstace(gameId);

  const enemyInstances = await getEnemyInstances(combatInstance.combatId);

  const heldenInstances = await getHeldenInstances(
    combatInstance.combatId,
    partyList,
  );

  //get actions
  const heldenActions = await Promise.all(
    heldenInstances.map(
      async (helden) => await getHeldenActionsById(helden.heldenId),
    ),
  );
  const creaturesActions = await Promise.all(
    enemyInstances.map(
      async (creature) => await getCreatureActionsById(creature.creatureId),
    ),
  );

  //atach actions to client data

  const clientHeldenData = heldenInstances.map((heldenInstance) => {
    const realHelden = partyList.find(
      (helden) => heldenInstance.heldenId === helden.id,
    );
    const actions = heldenActions.find(
      ([action]) => action.helden_id === heldenInstance.heldenId,
    );

    return {
      ...heldenInstance,
      ap: realHelden.stats.ap,
      sd: realHelden.stats.sd,
      pd: realHelden.stats.pd,
      name: realHelden.name,
      class: realHelden.class,
      slotPosition: realHelden.partySlot,
      actions: actions.map((action) => camelcaseKeys(action)),
    };
  });

  const clientCreaturesData = enemyInstances.map((creatureInstance) => {
    const actions = creaturesActions.find(
      ([action]) => creatureInstance.creatureId === action.creature_id,
    );

    return {
      ...creatureInstance,
      actions: actions.map((action) => camelcaseKeys(action)),
    };
  });

  const responseObj = {
    combatInstance: combatInstance,
    playerTeam: clientHeldenData,
    enemyTeam: clientCreaturesData,
  };

  return responseObj;
}

async function getCombatInstace(gameId) {
  let [combatInstance] = await sql`
  SELECT * FROM combat_instance
  WHERE game_id = ${gameId}`;

  if (combatInstance === undefined) {
    [combatInstance] = await sql`
  INSERT INTO combat_instance (game_id)
  VALUES (${gameId}) RETURNING *;
  `;
  }

  return camelcaseKeys(combatInstance);
}

export async function deleteCombatInstance(gameId) {
  await sql`DELETE FROM combat_instance WHERE game_id = ${gameId}`;
}

async function getHeldenInstances(combatId, partyList) {
  let heldenInstances = await sql`
  SELECT * FROM helden_instance WHERE combat_id = ${combatId};
  `;
  if (!heldenInstances.length) {
    const heldenInstancesObj = partyList.map((helden) => {
      return {
        helden_id: helden.id,
        instance_ve: helden.stats.ve,
        sa_avaliable: helden.sa,
        combat_id: combatId,
      };
    });

    await sql`
  INSERT INTO helden_instance ${sql(
    heldenInstancesObj,
    'helden_id',
    'instance_ve',
    'sa_avaliable',
    'combat_id',
  )};
  `;
    heldenInstances = await sql`
  SELECT * FROM helden_instance WHERE combat_id = ${combatId};
  `;
  }

  return heldenInstances.map((instance) => camelcaseKeys(instance));
}

async function getEnemyInstances(combatId) {
  let enemyInstances = await sql`
  SELECT *
    FROM creature_instance
    WHERE combat_id = ${combatId}`;

  //enemyParty is an array of 5 enemy names
  const enemyParty = testEncounter;

  const enemyPartyPromiseArray = enemyParty.map(
    async (enemyName) =>
      await sql`
  SELECT * FROM
   enemy_creatures as creature,
   creature_stats_set as stats,
   creature_type as type
  WHERE creature.name = ${enemyName}
  AND stats.stats_id = creature.stats_id
  AND type.creature_type_id = creature.creature_type_id
  ;`,
  );

  const instanceObjArr = (await Promise.all(enemyPartyPromiseArray)).map(
    ([obj], index) => {
      return {
        ...obj,
        combat_id: combatId,
        sa_avaliable: obj.sa_special_actions,
        instance_ve: obj.ve_vital_energy,
        slot_position: index + 1,
      };
    },
  );

  if (!enemyInstances.length) {
    await sql`
    INSERT INTO creature_instance ${sql(
      instanceObjArr,
      'creature_id',
      'combat_id',
      'sa_avaliable',
      'instance_ve',
      'slot_position',
    )};
    `;
    enemyInstances = await sql`SELECT * FROM creature_instance WHERE combat_id = ${combatId}`;
  }

  return enemyInstances
    .map((enemyInstance) => {
      const realEnemyRef = instanceObjArr.find(
        (enemy) => enemy.slot_position === enemyInstance.slot_position,
      );
      return {
        ...enemyInstance,
        name: realEnemyRef.name,
        ap: realEnemyRef.ap_action_power,
        sd: realEnemyRef.sd_supernatural_defense,
        pd: realEnemyRef.pd_physical_defense,
        type: {
          typeId: realEnemyRef.creature_type_id,
          typeImage: realEnemyRef.creature_type_image,
          typeName: realEnemyRef.creature_type_name,
        },
      };
    })
    .map((instance) => camelcaseKeys(instance));
}

async function getHeldenActionsById(heldenId) {
  return await sql`
  SELECT
    helden.helden_id as helden_id,
    action.combat_action_id as action_id,
    action.action_name as name,
    action.action_desc as desc,
    target.target_keyword_name as target,
    speed.speed_name as speed
  FROM
    helden,
    class_actions_set as junction,
    combat_action as action,
    target_keyword as target,
    action_type as action_type,
    action_speed as speed
  WHERE
    helden.helden_id = ${heldenId} AND
    helden.class_id = junction.class_id AND
    junction.combat_action_id = action.combat_action_id AND
    action.target_id = target.target_id AND
    action.action_type_id = action_type.action_type_id AND
    action_type.action_speed_id = speed.action_speed_id
  `;
}

async function getCreatureActionsById(creatureId) {
  return await sql`
  SELECT
    creature.creature_id as creature_id,
    action.combat_action_id as action_id,
    action.action_name as name,
    action.action_desc as desc,
    target.target_keyword_name as target,
    speed.speed_name as speed
  FROM
    enemy_creatures as creature,
    creature_actions_set as junction,
    combat_action as action,
    target_keyword as target,
    action_type as action_type,
    action_speed as speed
  WHERE
    creature.creature_id  = ${creatureId} AND
    creature.creature_type_id = junction.creature_type_id AND
    junction.combat_action_id = action.combat_action_id AND
    action.target_id = target.target_id AND
    action.action_type_id = action_type.action_type_id AND
    action_type.action_speed_id = speed.action_speed_id
  `;
}
