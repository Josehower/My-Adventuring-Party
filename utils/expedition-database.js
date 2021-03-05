import dotenv from 'dotenv';
import camelcaseKeys from 'camelcase-keys';
import { sql } from './account-database';
import { getGameByHeldenId, levelUp } from './helden-database';
import setPostgresDefaultsOnHeroku from './setPostgresDefaultsOnHeroku';

setPostgresDefaultsOnHeroku();

dotenv.config();

async function getStatIncrementObj(statPrefix, heldenId) {
  function isRareIncrement() {
    const boolean10 = Math.random() <= 0.2;
    return boolean10;
  }
  function isUncommonIncrement() {
    const boolean50 = Math.random() <= 0.4;
    return boolean50;
  }
  function isCommonIncrement() {
    const boolean80 = Math.random() <= 0.8;
    return boolean80;
  }

  // pull boostObject from id
  const [boostObject] = await sql`
  SELECT b.*, c.class_name
  FROM
  ${sql(`${statPrefix}_growth_set`)} as b,
  expedition_class_growth as ecg,
  helden_class as c,
  helden as h
  WHERE h.class_id = c.class_id
  AND ecg.expedition_growth_id =  c.expedition_growth_id
  AND b.${sql(`${statPrefix}_set_id`)} = ecg.${sql(`${statPrefix}_set_id`)}
  AND h.helden_id = ${heldenId};
    `;

  // calculate rate
  let increment = boostObject.allways_increment;

  if (isCommonIncrement()) {
    increment = boostObject.common_increment;
  }
  if (isUncommonIncrement()) {
    increment = boostObject.uncommon_increment;
  }
  if (isRareIncrement()) {
    increment = boostObject.rare_increment;
  }

  return increment;
}

export async function boostHeldenAfterExpedition(heldenId) {
  console.log('boostHeldenAfterExpedition', heldenId);
  const veIncrement = await getStatIncrementObj('ve', heldenId);
  const apIncrement = await getStatIncrementObj('ap', heldenId);
  const sdIncrement = await getStatIncrementObj('sd', heldenId);
  const pdIncrement = await getStatIncrementObj('pd', heldenId);

  const [{ stats_id: heldenStatsId }] = await sql`
  SELECT stats_id, name
  FROM helden
  WHERE helden_id = ${heldenId};`;

  const [stats] = await sql`
  SELECT *  FROM helden_stats_set
    WHERE stats_id = ${heldenStatsId};`;

  const additionalVe = (veIncrement / 100) * stats.ve_vital_energy;
  const newVe = Math.ceil(additionalVe + stats.ve_vital_energy);

  const additionalAp = (apIncrement / 100) * stats.ap_action_power;
  const newAp = Math.ceil(additionalAp + stats.ap_action_power);

  let newSd;
  if (stats.sd_supernatural_defense >= 30) {
    newSd = 30;
  } else {
    const additionalSd = (sdIncrement / 100) * stats.sd_supernatural_defense;
    newSd = Math.ceil(additionalSd + stats.sd_supernatural_defense);
  }

  let newPd;
  if (stats.pd_physical_defense >= 30) {
    newPd = 30;
  } else {
    const additionalPd = (pdIncrement / 100) * stats.pd_physical_defense;
    newPd = Math.ceil(additionalPd + stats.pd_physical_defense);
  }

  let lvlUp = false;

  const newExpShardValue = stats.exs_experience_shards + 1;
  if (stats.exs_experience_shards === 4) {
    await sql`
      UPDATE helden_stats_set
      SET
      ve_vital_energy = ${newVe},
      ap_action_power = ${newAp},
      sd_supernatural_defense = ${newSd},
      pd_physical_defense = ${newPd}
      WHERE  stats_id  = ${heldenStatsId};`;

    await levelUp(heldenId);
    lvlUp = true;
  } else {
    await sql`
      UPDATE helden_stats_set
      SET
      ve_vital_energy = ${newVe},
      ap_action_power = ${newAp},
      sd_supernatural_defense = ${newSd},
      pd_physical_defense = ${newPd},
      exs_experience_shards = ${newExpShardValue}
      WHERE  stats_id  = ${heldenStatsId};`;
  }

  return {
    message: `your helden came from the expedition with more stats ${
      lvlUp ? 'and lvlUp' : ''
    }`,
  };
}

export async function getExpeditionByHeldenId(heldenId) {
  const [expeditionData] = await sql`
  SELECT
    stat.lvl_level,
    h.name,
    h.helden_id,
    e.expedition_start_date,
    e.expedition_Id
  FROM helden as h
  JOIN expedition as e
    ON e.helden_id = h.helden_id
  JOIN helden_stats_set as stat
    ON h.stats_id = stat.stats_id
  WHERE h.helden_id = ${heldenId}; `;

  return camelcaseKeys(expeditionData);
}

export async function getGameExpeditionList(gameId) {
  const heldenOnExpeditionIdList = await sql`
  SELECT
    stat.lvl_level,
    e.expedition_id
  FROM
    helden as h
  JOIN expedition as e
    ON e.helden_id = h.helden_id
  JOIN helden_stats_set as stat
    ON h.stats_id = stat.stats_id
  JOIN game_instance as g
    ON h.game_id = g.game_id
  WHERE g.game_id = ${gameId};`;

  const rawPromisesList = heldenOnExpeditionIdList.map(async (expedition) => {
    const expeditionData = camelcaseKeys(expedition);
    return await sql`
  SELECT
    e.expedition_start_date + i.expedition_interval as end_date,
    e.expedition_id,
    e.helden_id
  FROM
    expedition as e,
    expedition_interval as i
  WHERE e.expedition_id = ${expeditionData.expeditionId}
  AND i.lvl = ${expeditionData.lvlLevel};
  `;
  });

  const cleanedExpeditionPromisesList = (
    await Promise.all(rawPromisesList)
  ).map(async ([dataObj]) => {
    const isExpeditionExpired = +dataObj.end_date - Date.now() < 0;

    if (isExpeditionExpired) {
      console.log(
        'expedition expired and deleted on getGameExpeditionList',
        dataObj.helden_id,
      );
      await boostHeldenAfterExpedition(dataObj.helden_id);
      return await sql`DELETE FROM expedition WHERE expedition_id = ${dataObj.expedition_id} `;
    }

    return;
  });

  await Promise.all(cleanedExpeditionPromisesList);

  const expeditionList = await sql`
  SELECT
    g.game_id,
    stat.lvl_level,
    h.name,
    h.helden_id,
    e.expedition_start_date,
    c.class_name,
    c.class_image
  FROM
    helden as h,
    expedition as e,
    helden_stats_set as stat,
    game_instance as g,
    helden_class as c
  WHERE
    g.game_id = ${gameId} AND
    e.helden_id = h.helden_id AND
    h.stats_id = stat.stats_id AND
    h.game_id = g.game_id AND
    h.class_id = c.class_id;`;

  return expeditionList.map((expedition) => camelcaseKeys(expedition));
}

export async function createExpeditionByHeldenId(heldenId) {
  const [game] = await getGameByHeldenId(heldenId);

  await sql`INSERT
  INTO expedition (game_id, helden_id)
  VALUES (${game.gameId},${heldenId});`;

  return { message: 'your helden is on a expedition' };
}

export async function getHeldenExpeditionEndTime(heldenId) {
  console.log('getHeldenExpeditionTimeLeft', heldenId);
  const expedition = await getExpeditionByHeldenId(heldenId);

  if (expedition === undefined) {
    console.log('this expedition dont exist ');
    return false;
  }

  const [{ end_date: endTime, expedition_id: expeditionId }] = await sql`
  SELECT
    e.expedition_start_date + i.expedition_interval as end_date,
    e.expedition_id
  FROM
    expedition as e,
    expedition_interval as i
  WHERE e.expedition_id = ${expedition.expeditionId}
  AND i.lvl = ${expedition.lvlLevel};
  `;

  const isExpeditionExpired = +endTime - Date.now() < 0;

  if (isExpeditionExpired) {
    console.log('expired and deleted on getHeldenExpeditionTimeLeft', heldenId);
    await boostHeldenAfterExpedition(heldenId);
    await sql`DELETE FROM expedition WHERE expedition_id = ${expeditionId} `;
    return false;
  }



  return +endTime;
}
