import dotenv from 'dotenv';
import camelcaseKeys from 'camelcase-keys';
import { sql } from './account-database';
import { getHeldenListByGameId } from './helden-database';
import { testEncounter } from './encounterList';
import { throwServerError } from '@apollo/client';

dotenv.config();

export async function initializeCombat(gameId) {
  const heldenList = await getHeldenListByGameId(gameId);

  const partyList = heldenList
    .filter((helden) => helden.partySlot !== null)
    .sort((a, b) => a.partySlot - b.partySlot);

  if (partyList.length === 0) {
    return false;
  }

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

export async function isCombatInstanceOn(gameId) {
  let [combatInstance] = await sql`
  SELECT * FROM combat_instance
  WHERE game_id = ${gameId}`;

  if (combatInstance === undefined) {
    return false;
  }

  return camelcaseKeys(combatInstance);
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

  return { message: `combat was successfully deleted from game # ${gameId}` };
}

async function getHeldenInstances(combatId, partyList = null) {
  let heldenInstances = await sql`
  SELECT * FROM helden_instance WHERE combat_id = ${combatId};
  `;
  if (!heldenInstances.length) {
    if (!partyList) return;

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
    .sort((a, b) => a.slot_position - b.slot_position)
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
    action.effect_ref as effect,
    target.target_keyword_name as target,
    type.action_type_name as type,
    speed.speed_name as speed
  FROM
    helden,
    class_actions_set as junction,
    combat_action as action,
    target_keyword as target,
    action_type as type,
    action_speed as speed
  WHERE
    helden.helden_id = ${heldenId} AND
    helden.class_id = junction.class_id AND
    junction.combat_action_id = action.combat_action_id AND
    action.target_id = target.target_id AND
    action.action_type_id = type.action_type_id AND
    type.action_speed_id = speed.action_speed_id
  `;
}

async function getCreatureActionsById(creatureId) {
  return await sql`
  SELECT
    creature.creature_id as creature_id,
    action.combat_action_id as action_id,
    action.action_name as name,
    action.action_desc as desc,
    action.effect_ref as effect,
    target.target_keyword_name as target,
    type.action_type_name as type,
    speed.speed_name as speed
  FROM
    enemy_creatures as creature,
    creature_actions_set as junction,
    combat_action as action,
    target_keyword as target,
    action_type as type,
    action_speed as speed
  WHERE
    creature.creature_id  = ${creatureId} AND
    creature.creature_type_id = junction.creature_type_id AND
    junction.combat_action_id = action.combat_action_id AND
    action.target_id = target.target_id AND
    action.action_type_id = type.action_type_id AND
    type.action_speed_id = speed.action_speed_id
  `;
}

export async function updateCombat(script, gameId) {
  const combatInstance = await getCombatInstace(gameId);

  const enemyTeamActions = script.enemyTeam.filter((action) => action);
  const enemyLoopAmount = enemyTeamActions.length;

  const playerTeamActions = script.playerTeam.filter((action) => action);
  const playerLoopAmount = playerTeamActions.length;

  let heldenActionsResults = [];
  let creatureActionsResults = [];

  if (combatInstance.actualTurn % 2) {
    console.log(combatInstance.actualTurn, 'first action creatures');
    for (let i = 0; i < enemyLoopAmount; i++) {
      const currentAction = enemyTeamActions[i];
      creatureActionsResults.push(await enemyActionResolver(currentAction));
    }

    for (let i = 0; i < playerLoopAmount; i++) {
      const currentAction = playerTeamActions[i];
      heldenActionsResults.push(await heldenActionResolver(currentAction));
    }
    console.log(creatureActionsResults, heldenActionsResults);
  } else {
    console.log(combatInstance.actualTurn, 'first action helden');
    for (let i = 0; i < playerLoopAmount; i++) {
      const currentAction = playerTeamActions[i];
      heldenActionsResults.push(await heldenActionResolver(currentAction));
    }

    for (let i = 0; i < enemyLoopAmount; i++) {
      const currentAction = enemyTeamActions[i];
      creatureActionsResults.push(await enemyActionResolver(currentAction));
    }
    console.log(heldenActionsResults, creatureActionsResults);
  }

  await sql`
  UPDATE
    combat_instance
  SET
    actual_turn = ${combatInstance.actualTurn + 1}
  WHERE
    game_id = ${gameId}
  `;

  const newCombatState = await initializeCombat(gameId);

  newCombatState.playerTeam.forEach((helden) => {
    if (helden.saAvaliable === 0) {
      helden.actions = helden.actions.filter(
        (action) => action.type === 'basic',
      );
      return helden;
    }

    return helden;
  });

  newCombatState.enemyTeam.forEach((creature) => {
    if (creature.saAvaliable === 0) {
      creature.actions = creature.actions.filter(
        (action) => action.type === 'basic',
      );
      return creature;
    }

    return creature;
  });

  return {
    ...newCombatState,
    results: { heldenActionsResults, creatureActionsResults },
  };
}

async function heldenActionResolver({ actionId, heldenInstanceId, target }) {
  const {
    heldenInstanceId: instanceId,
    heldenId,
    combatId,
    saAvaliable,
    instanceVe,
    ap: performerAp,
  } = await getSingleHeldenInstance(heldenInstanceId);

  // console.log(await getSingleHeldenInstance(heldenInstanceId));

  let targetInstance;
  let newTargetState;

  const actionPerformed = (await getHeldenActionsById(heldenId)).find(
    (action) => action.action_id === actionId,
  );

  if (!actionPerformed) {
    throw new Error('this helden action is invalid');
  }

  if (actionPerformed.target === 'enemy') {
    targetInstance = await getSingleEnemyInstance(target);
    const damageNature = await getHeldenDamageNatureBy(heldenId);

    //check if the action is dodged
    let isDodged;
    if (damageNature === 'Supernatural') {
      isDodged = isActionDodged(targetInstance.sd);
    } else {
      isDodged = isActionDodged(targetInstance.pd);
    }

    // check if there are enough SA and calculate the new SA
    if (actionPerformed.type === 'special attack') {
      if (saAvaliable === 0) return;

      await sql`
      UPDATE
        helden_instance
      SET
        sa_Avaliable = ${saAvaliable - 1}
      WHERE
        helden_instance_id = ${heldenInstanceId}
      RETURNING *;
      `;
    }

    if (isDodged) {
      console.log('action dodged');
      return {
        newVe: -1,
        targetTeam: 'enemy',
      };
    }

    //if damaga is dealt, calculate the damafe
    const damage = performerAp * (actionPerformed.effect / 100);
    let newVe = targetInstance.instanceVe - damage;
    //check values below 0
    newVe = newVe < 0 ? 0 : newVe;

    // update VE on target Instance
    newTargetState = await sql`
    UPDATE
      creature_instance
    SET
      instance_ve = ${newVe}
    WHERE
      creature_instance_id = ${target}
    RETURNING *;
    `;
  } else {
    targetInstance = await getSingleHeldenInstance(target);

    if (actionPerformed.type === 'healing') {
      if (saAvaliable === 0) return;

      await sql`
      UPDATE
        helden_instance
      SET
        sa_Avaliable = ${saAvaliable - 1}
      WHERE
        helden_instance_id = ${heldenInstanceId}
      RETURNING *;
      `;
    }

    //calculate the new VE
    const healing = performerAp * (actionPerformed.effect / 100);
    let newVe = targetInstance.instanceVe + healing;
    //a helden cannot have more ve than his initial ve
    newVe = newVe > targetInstance.ve ? targetInstance.ve : newVe;

    newTargetState = await sql`
    UPDATE
      helden_instance
    SET
      instance_ve = ${newVe}
    WHERE
      helden_instance_id = ${target}
    RETURNING *;
    `;
  }
  return {
    newVe: newTargetState[0].instance_ve,
    targetTeam: actionPerformed.target,
  };
}

async function enemyActionResolver({ actionId, creatureInstanceId, target }) {
  const {
    creatureId,
    combatId,
    saAvaliable,
    instanceVe,
    slotPosition,
    ve: maxVe,
    ap: performerAp,
    sd,
    pd,
  } = await getSingleEnemyInstance(creatureInstanceId);

  let targetInstance;
  let newTargetState;

  const actionPerformed = (await getCreatureActionsById(creatureId)).find(
    (action) => action.action_id === actionId,
  );

  if (!actionPerformed) {
    throw new Error('this creature action is invalid');
  }

  if (actionPerformed.target === 'enemy') {
    targetInstance = await getSingleHeldenInstance(target);
    const damageNature = await getCreatureDamageNatureBy(creatureId);

    //check if the action is dodged
    let isDodged;
    if (damageNature === 'Supernatural') {
      isDodged = isActionDodged(targetInstance.sd);
    } else {
      isDodged = isActionDodged(targetInstance.pd);
    }

    // check if there are enough SA and calculate the new SA
    if (actionPerformed.type === 'special attack') {
      if (saAvaliable === 0) return;

      await sql`
      UPDATE
        creature_instance
      SET
        sa_Avaliable = ${saAvaliable - 1}
      WHERE
        creature_instance_id = ${creatureInstanceId}
      RETURNING *;
      `;
    }

    if (isDodged) {
      console.log('the helden dodged');
      return {
        newVe: -1,
        targetTeam: 'enemy',
      };
    }

    //if damage is dealt, calculate the damage
    const damage = performerAp * (actionPerformed.effect / 100);
    let newVe = targetInstance.instanceVe - damage;
    //check values below 0
    newVe = newVe < 0 ? 0 : newVe;

    // update VE on target Instance
    newTargetState = await sql`
    UPDATE
      helden_instance
    SET
      instance_ve = ${newVe}
    WHERE
      helden_instance_id = ${target}
    RETURNING *;
    `;
  } else {
    targetInstance = await getSingleEnemyInstance(target);

    if (actionPerformed.type === 'healing') {
      if (saAvaliable === 0) return;

      await sql`
      UPDATE
        creature_instance
      SET
        sa_Avaliable = ${saAvaliable - 1}
      WHERE
        creature_instance_id = ${creatureInstanceId}
      RETURNING *;
      `;
    }

    //calculate the new VE
    const healing = performerAp * (actionPerformed.effect / 100);
    let newVe = targetInstance.instanceVe + healing;
    //a helden cannot have more ve than his initial ve
    newVe = newVe > targetInstance.ve ? targetInstance.ve : newVe;

    newTargetState = await sql`
    UPDATE
      creature_instance
    SET
      instance_ve = ${newVe}
    WHERE
      creature_instance_id = ${target}
    RETURNING *;
    `;
  }
  return {
    newVe: newTargetState[0].instance_ve,
    targetTeam: actionPerformed.target,
  };
}

async function getSingleHeldenInstance(instanceId) {
  const [instance] = await sql`
  SELECT
    instance.*,
    stats.ve_vital_energy as ve,
    stats.ap_action_power as ap,
    stats.sd_supernatural_defense as sd,
    stats.pd_physical_defense as pd
  FROM
    helden_instance as instance,
    helden_stats_set as stats,
    helden
  WHERE
    instance.helden_instance_id = ${instanceId} AND
    instance.helden_id = helden.helden_id AND
    helden.stats_id = stats.stats_id

`;

  return camelcaseKeys(instance);
}
async function getSingleEnemyInstance(instanceId) {
  const [instance] = await sql`
  SELECT
    instance.*,
    stats.ve_vital_energy as ve,
    stats.ap_action_power as ap,
    stats.sd_supernatural_defense as sd,
    stats.pd_physical_defense as pd
  FROM
    creature_instance as instance,
    creature_stats_set as stats,
    enemy_creatures as creature
  WHERE
    instance.creature_instance_id = ${instanceId} AND
    instance.creature_id = creature.creature_id AND
    creature.stats_id = stats.stats_id
`;

  return camelcaseKeys(instance);
}

function isActionDodged(defense) {
  const isDodged = Math.random() <= defense / 100;
  return isDodged;
}

async function getHeldenDamageNatureBy(heldenId) {
  const [{ damage_nature }] = await sql`
  SELECT class.damage_nature FROM
    helden,
    helden_class as class
  WHERE
    helden.helden_id = ${heldenId}
  AND
    helden.class_id = class.class_id
  `;
  return damage_nature;
}

async function getCreatureDamageNatureBy(creatureId) {
  const [{ damage_nature }] = await sql`
  SELECT type.damage_nature FROM
    enemy_creatures as creatures,
    creature_type as type
  WHERE
    creatures.creature_id = ${creatureId}
  AND
    creatures.creature_type_id = type.creature_type_id
  `;
  return damage_nature;
}
