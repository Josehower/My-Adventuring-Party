import dotenv from 'dotenv';
import camelcaseKeys from 'camelcase-keys';
import { sql } from './account-database';

dotenv.config();

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

  // return camelcaseKeys(helden);
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

    console.log(heldenClass);

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

  console.log(heldenList);

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
