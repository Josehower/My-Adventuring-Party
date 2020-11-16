import dotenv from 'dotenv';
import camelcaseKeys from 'camelcase-keys';
import { sql } from './account-database';
import { getHeldenListByGameId } from './helden-database';

dotenv.config();

export async function initializeCombat(gameId) {
  const [combatInstance] = await sql`
INSERT INTO combat_instance (game_id) VALUES (${gameId}) RETURNING *;
  `;

  const heldenList = await getHeldenListByGameId(gameId);

  const partyList = heldenList
    .filter((helden) => helden.partySlot !== null)
    .sort((a, b) => a.partySlot - b.partySlot);

  const heldenInstancesObj = partyList.map((helden) => {
    return {
      helden_id: helden.id,
      instance_ve: helden.stats.ve,
      sa_avaliable: helden.sa,
      combat_id: combatInstance.combat_id,
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

  const heldenInstances = await sql`SELECT * FROM helden_instance WHERE combat_id = ${combatInstance.combat_id}`;

  const clientHeldenData = heldenInstances.map((heldenIntance) => {
    const realHelden = partyList.find(
      (helden) => heldenIntance.helden_id === helden.id,
    );

    return {
      ...camelcaseKeys(heldenIntance),
      ap: realHelden.stats.ap,
      sd: realHelden.stats.sd,
      pd: realHelden.stats.pd,
      name: realHelden.name,
      class: realHelden.class,
    };
  });

  const responseObj = {
    combatInstance: camelcaseKeys(combatInstance),
    playerTeam: clientHeldenData,
  };

  console.log(responseObj);

  return responseObj;
}
