import dotenv from 'dotenv';
import camelcaseKeys from 'camelcase-keys';
import { sql } from './account-database';

dotenv.config();

export async function getGameByHeldenId(HeldenId) {
  const game = await sql`
SELECT g.*
  FROM
  game_instance as g,
  helden as h
  WHERE
  g.game_id = h.game_id
  AND
  h.helden_id = ${HeldenId};
`;
  return camelcaseKeys(game);
}

async function getHeldenById(heldenId) {
  const [helden] = await sql`
  SELECT * FROM helden
  WHERE helden_id = ${heldenId};
  `;

  return await camelcaseKeys(helden);
}

export async function deleteHeldenById(heldenId) {
  const [{ stats_id: heldenStatsId }] = await sql`
  SELECT stats_id
  FROM helden
  WHERE helden_id = ${heldenId};`;

  await sql`
  DELETE FROM helden_stats_set
  WHERE stats_id = ${heldenStatsId};
  `;

  await sql`
  DELETE FROM helden
  WHERE helden_id = ${heldenId};
  `;

  return {
    message: `Your Helden was successfully eliminated`,
  };
}

export async function createHelden(className, heldenName, gameId) {
  const [{ class_stats_id: classStatsID, class_id: classId }] = await sql`
SELECT * FROM helden_class WHERE class_name = ${className};
`;

  const [
    {
      ve_class_base: ve,
      ap_class_base: ap,
      sd_class_base: sd,
      pd_class_base: pd,
    },
  ] = await sql`
SELECT * FROM class_stats_on_lvl_1 WHERE class_stats_id = ${classStatsID};
`;

  const [
    { stats_id: statsId },
  ] = await sql`INSERT INTO helden_stats_set (ve_vital_energy, ap_action_power, sd_supernatural_defense, pd_physical_defense) VALUES (${ve},${ap},${sd},${pd}) RETURNING *;`;

  await sql`INSERT INTO helden (game_id, class_id, stats_id, name) VALUES (${gameId},${classId},${statsId},${heldenName}) RETURNING *;`;

  return {
    message: `a new ${className} helden with name ${heldenName} has been created `,
  };
}

export async function getHeldenListByGameId(gameId) {
  const rawHeldenList = await sql`
  SELECT * FROM helden WHERE game_id = ${gameId};
  `;

  //Lists of Promises with stats and classes for the map
  const statsPromises = rawHeldenList.map((helden) =>
    getStatsById(helden.stats_id),
  );
  const classPromises = rawHeldenList.map((helden) =>
    getHeldenClassById(helden.class_id),
  );

  //Lists with stats and classes for the map
  const heldenStatsArray = await Promise.all(statsPromises);
  const heldenClassArray = await Promise.all(classPromises);

  const heldenList = rawHeldenList.map((helden) => {
    const heldenStats = heldenStatsArray.find(
      (stats) => stats.statsId === helden.stats_id,
    );
    const heldenClass = heldenClassArray.find(
      (classObj) => classObj.classId === helden.class_id,
    );

    return {
      id: helden.helden_id,
      gameId: gameId,
      name: helden.name,
      lvl: heldenStats.lvlLevel,
      exs: heldenStats.exsExperienceShards,
      sa: heldenStats.saSpecialActions,
      partySlot: helden.party_slot,
      class: {
        classId: heldenClass.classId,
        className: heldenClass.className,
        classImg: heldenClass.classImage,
      },
      stats: {
        ve: heldenStats.veVitalEnergy,
        ap: heldenStats.apActionPower,
        sd: heldenStats.sdSupernaturalDefense,
        pd: heldenStats.pdPhysicalDefense,
      },
    };
  });

  return heldenList;
}

async function getStatsById(statsId) {
  const [stats] = await sql`
  SELECT * FROM helden_stats_set
    WHERE stats_id = ${statsId};`;
  return camelcaseKeys(stats);
}
async function getHeldenClassById(classId) {
  const [heldenClass] = await sql`
  SELECT * FROM helden_class
    WHERE class_id = ${classId};`;
  return camelcaseKeys(heldenClass);
}

export async function heldenToParty(heldenId, spot) {
  await sql`
  UPDATE helden
  SET party_slot = ${spot}
  WHERE helden_id = ${heldenId};`;

  return { message: `new Helden added to spot ${spot}` };
}

export async function heldenToBench(heldenId) {
  await sql`
  UPDATE helden
  SET party_slot = null
  WHERE helden_id = ${heldenId};`;

  return { message: `Helden removed from party` };
}

export async function upgradeHeldenVeById(heldenId, amount = 10) {
  const [{ stats_id: heldenStatsId, name }] = await sql`
  SELECT stats_id, name
  FROM helden
  WHERE helden_id = ${heldenId};`;

  const [{ ve_vital_energy, exs_experience_shards, lvl_level }] = await sql`
  SELECT ve_vital_energy, exs_experience_shards, lvl_level  FROM helden_stats_set
    WHERE stats_id = ${heldenStatsId};`;

  if (lvl_level === 10 && exs_experience_shards === 4) {
    return {
      message: `you are going too fast, lvl 10 is the cap. Wait for the expansion!!!`,
    };
  }
  //get cap by level
  //if ve is === the cap return

  const additionalValue = (amount / 100) * ve_vital_energy;
  const newValue = additionalValue + ve_vital_energy;

  // if new value is over the cap new value is cap

  let newExpShardValue = exs_experience_shards + 1;
  if (exs_experience_shards === 4) {
    await sql`
    UPDATE helden_stats_set
    SET ve_vital_energy = ${newValue}
    WHERE  stats_id  = ${heldenStatsId};`;

    await levelUp(heldenId);
  } else {
    await sql`
    UPDATE helden_stats_set
    SET ve_vital_energy = ${newValue}, exs_experience_shards = ${newExpShardValue}
    WHERE  stats_id  = ${heldenStatsId};`;
  }

  return { message: `${name} feels stronger` };
}

export async function upgradeHeldenApById(heldenId, amount = 10) {
  const [{ stats_id: heldenStatsId, name }] = await sql`
  SELECT stats_id, name
  FROM helden
  WHERE helden_id = ${heldenId};`;

  const [
    { ap_action_power, exs_experience_shards, lvl_level, sa_special_actions },
  ] = await sql`
  SELECT ap_action_power, exs_experience_shards, lvl_level, sa_special_actions  FROM helden_stats_set
    WHERE stats_id = ${heldenStatsId};`;

  if (lvl_level === 10 && exs_experience_shards === 4) {
    return {
      message: `you are going too fast, lvl 10 is the cap. Wait for the expansion!!!`,
    };
  }

  const additionalValue = (amount / 100) * ap_action_power;
  const newValue = additionalValue + ap_action_power;

  let newExpShardValue = exs_experience_shards + 1;
  if (exs_experience_shards === 4) {
    await sql`
    UPDATE helden_stats_set
    SET ap_action_power = ${newValue}
    WHERE  stats_id  = ${heldenStatsId};`;

    await levelUp(heldenId);
  } else {
    await sql`
    UPDATE helden_stats_set
    SET ap_action_power = ${newValue}, exs_experience_shards = ${newExpShardValue}
    WHERE  stats_id  = ${heldenStatsId};`;
  }

  return { message: `${name} feels powerfull` };
}

export async function upgradeHeldenPdById(heldenId, amount = 4) {
  const [{ stats_id: heldenStatsId, name }] = await sql`
  SELECT stats_id, name
  FROM helden
  WHERE helden_id = ${heldenId};`;

  const [{ pd_physical_defense, exs_experience_shards, lvl_level }] = await sql`
  SELECT pd_physical_defense , exs_experience_shards, lvl_level, sa_special_actions  FROM helden_stats_set
    WHERE stats_id = ${heldenStatsId};`;

  if (lvl_level === 10 && exs_experience_shards === 4) {
    return {
      message: `you are going too fast, lvl 10 is the cap. Wait for the expansion!!!`,
    };
  }
  if (pd_physical_defense === 30) {
    return { message: `ups, it looks this defense is capped` };
  }

  const additionalValue = amount;
  let newValue = additionalValue + pd_physical_defense;
  if (newValue > 30) {
    newValue = 30;
  }

  let newExpShardValue = exs_experience_shards + 1;
  if (exs_experience_shards === 4) {
    await sql`
      UPDATE helden_stats_set
      SET pd_physical_defense = ${newValue}
      WHERE  stats_id  = ${heldenStatsId};`;

    await levelUp(heldenId);
  } else {
    await sql`
      UPDATE helden_stats_set
      SET pd_physical_defense = ${newValue}, exs_experience_shards = ${newExpShardValue}
      WHERE  stats_id  = ${heldenStatsId};`;
  }

  return { message: `${name} feels can resist more physical damage` };
}

export async function upgradeHeldenSdById(heldenId, amount = 4) {
  const [{ stats_id: heldenStatsId, name }] = await sql`
  SELECT stats_id, name
  FROM helden
  WHERE helden_id = ${heldenId};`;

  const [
    { sd_supernatural_defense, exs_experience_shards, lvl_level },
  ] = await sql`
  SELECT sd_supernatural_defense , exs_experience_shards, lvl_level, sa_special_actions  FROM helden_stats_set
    WHERE stats_id = ${heldenStatsId};`;

  if (lvl_level === 10 && exs_experience_shards === 4) {
    return {
      message: `you are going too fast, lvl 10 is the cap. Wait for the expansion!!!`,
    };
  }
  if (sd_supernatural_defense === 30) {
    return { message: `ups, it looks this defense is capped` };
  }

  const additionalValue = amount;
  let newValue = additionalValue + sd_supernatural_defense;
  if (newValue > 30) {
    newValue = 30;
  }

  let newExpShardValue = exs_experience_shards + 1;
  if (exs_experience_shards === 4) {
    await sql`
      UPDATE helden_stats_set
      SET sd_supernatural_defense = ${newValue}
      WHERE  stats_id  = ${heldenStatsId};`;

    await levelUp(heldenId);
  } else {
    await sql`
      UPDATE helden_stats_set
      SET sd_supernatural_defense = ${newValue}, exs_experience_shards = ${newExpShardValue}
      WHERE  stats_id  = ${heldenStatsId};`;
  }

  return { message: `${name} feels can resist more supernatural damage` };
}

export async function levelUp(heldenId) {
  const helden = await getHeldenById(heldenId);
  const heldenStats = await getStatsById(helden.statsId);

  const [globalBoost] = await sql`
  select * from stats_increment_by_lvl_up where  new_lvl = ${
    heldenStats.lvlLevel + 1
  };
  `;

  const [heldenClassBoost] = await sql`
  SELECT cb.ve_class_boost as ve_boost , cb.ap_class_boost as ap_boost, cb.sd_class_boost as sd_boost, cb.pd_class_boost as pd_boost, c.class_name
  FROM  helden_class as c
  JOIN class_boost_stats_on_levelup  as cb on cb.stat_boost_id = c.stat_boost_id
  WHERE c.class_id = ${helden.classId};
  `;

  const rawLvlVeIncrement = Math.ceil(
    (globalBoost.ve_ap_increment / 100) * heldenStats.veVitalEnergy,
  );
  const rawClassVeIncrement = Math.ceil(
    (heldenClassBoost.ve_boost / 100) * heldenStats.veVitalEnergy,
  );
  const rawExtraVeIncrement = Math.ceil(
    (globalBoost.ve_extra_increment / 100) * heldenStats.veVitalEnergy,
  );
  const newVeStat =
    heldenStats.veVitalEnergy +
    rawLvlVeIncrement +
    rawClassVeIncrement +
    rawExtraVeIncrement;

  const rawLvlApIncrement = Math.ceil(
    (globalBoost.ve_ap_increment / 100) * heldenStats.apActionPower,
  );
  const rawClassApIncrement = Math.ceil(
    (heldenClassBoost.ap_boost / 100) * heldenStats.apActionPower,
  );
  const newApStat =
    heldenStats.apActionPower + rawLvlApIncrement + rawClassApIncrement;

  const rawLvlSdIncrement = globalBoost.def_increment;
  const rawClassSdIncrement = heldenClassBoost.sd_boost;
  const newSdStat =
    heldenStats.sdSupernaturalDefense + rawLvlSdIncrement + rawClassSdIncrement;

  const rawLvlPdIncrement = globalBoost.def_increment;
  const rawClassPdIncrement = heldenClassBoost.pd_boost;
  const newPdStat =
    heldenStats.pdPhysicalDefense + rawLvlPdIncrement + rawClassPdIncrement;

  const newSa = globalBoost.new_total_sa;

  const response = await sql`
  UPDATE helden_stats_set
  SET
    ve_vital_energy = ${newVeStat},
    ap_action_power = ${newApStat},
    sd_supernatural_defense = ${newSdStat},
    pd_physical_defense = ${newPdStat},
    lvl_level= ${globalBoost.new_lvl},
    exs_experience_shards = 0,
    sa_special_actions= ${newSa}
  WHERE stats_id  = ${heldenId} returning *;`;

  return;
}
