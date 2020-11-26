import React, { useState } from 'react';
import { initializeApollo } from '../apollo/client';
import { isSessionTokenValid } from '../utils/auth';
import nextCookies from 'next-cookies';
import {
  deleteCombatInstance,
  initializeCombat,
} from '../utils/Combat-database';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import CombatTeamParty from '../components/CombatTeamParty';
import CombatEnemyTeam from '../components/CombatEnemyTeam';
import { gql, useMutation } from '@apollo/client';
import { pause } from '../utils/timer';

const CombatFrame = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;

  h1 {
    grid-column: span 2;
  }
`;

const updateCombatMutation = gql`
  mutation updateCombat($combatScript: TurnScript!) {
    updateCombat(script: $combatScript) {
      combatInstance {
        combatId
        actualTurn
        gameId
      }
      playerTeam {
        actions {
          heldenId
          actionId
          desc
          name
          target
          speed
        }
        ap
        combatId
        heldenId
        heldenInstanceId
        instanceVe
        name
        pd
        saAvaliable
        sd
        slotPosition
        class {
          classImg
          className
        }
      }
      enemyTeam {
        actions {
          creatureId
          actionId
          desc
          name
          target
          speed
        }
        ap
        combatId
        creatureId
        creatureInstanceId
        instanceVe
        name
        pd
        saAvaliable
        sd
        slotPosition
        type {
          typeImage
        }
      }
    }
  }
`;

const StoryMode = (props) => {
  const { register, handleSubmit, errors, watch } = useForm();
  const [clientDataHistory, setClientDataHistory] = useState([
    props.clientInfo,
  ]);
  const [clientData, setClientData] = useState(props.clientInfo);
  const [activeEnemy, setActiveEnemy] = useState(0);
  const [activeHelden, setActiveHelden] = useState(0);
  const [targetedEnemy, setTargetedEnemy] = useState(0);
  const [targetedHelden, setTargetedHelden] = useState(0);
  const [healedEnemy, setHealedEnemy] = useState(0);
  const [healedHelden, setHealedHelden] = useState(0);

  const [updateCombat] = useMutation(updateCombatMutation);

  const enemyTeamVitalEnergy = clientData.enemyTeam.reduce((acc, enemy) => {
    return enemy.instanceVe + acc;
  }, 0);
  const playerTeamVitalEnergy = clientData.playerTeam.reduce((acc, helden) => {
    return helden.instanceVe + acc;
  }, 0);

  async function animate(action, performerIndex) {
    return new Promise(async (resolve) => {
      const targetOptions = {
        creature: {
          enemy: 'helden',
          party: 'creature',
        },
        helden: {
          enemy: 'creature',
          party: 'helden',
        },
      };
      const animation = {
        creature: {
          creature: setHealedEnemy,
          perform: setActiveEnemy,
          helden: setTargetedHelden,
        },
        helden: {
          helden: setHealedHelden,
          perform: setActiveHelden,
          creature: setTargetedEnemy,
        },
      };
      const performerTeam = action.team; //creature or Helden
      const targetTeam =
        targetOptions[performerTeam][
          action.targetKey /*TagetKey can be "party" or "enemy"*/
        ]; //creature or Helden

      const targetPosition = parseInt(action.TargetPosistion); //positionNumber
      const PerformerAnimationFunct = animation[action.team].perform;
      const targetAnimationFunc = animation[performerTeam][targetTeam];
      PerformerAnimationFunct(performerIndex);
      await pause(200);
      targetAnimationFunc(targetPosition);
      await pause(200);
      PerformerAnimationFunct(0);
      await pause(200);
      targetAnimationFunc(0);
      await pause(200);

      resolve();
    });
  }

  async function hit({
    enemyTeam: stringEnemyTeam,
    playerTeam: stringPlayerTeam,
  }) {
    const isPlayerFirst = clientData.combatInstance.actualTurn % 2 === 0;

    const enemyTeam = stringEnemyTeam.map((action) => {
      return {
        actionId: parseInt(action.actionId, 10),
        target: parseInt(action.target, 10),
        creatureInstanceId: parseInt(action.creatureInstanceId, 10),
      };
    });
    const playerTeam = stringPlayerTeam.map((action) => {
      return {
        actionId: parseInt(action.actionId, 10),
        target: parseInt(action.target, 10),
        heldenInstanceId: parseInt(action.heldenInstanceId, 10),
      };
    });
    const combatScript = { enemyTeam, playerTeam };

    const { data } = await updateCombat({
      variables: {
        combatScript: combatScript,
      },
    });
    console.log(stringEnemyTeam);
    console.log(stringPlayerTeam);
    if (isPlayerFirst) {
      for (let i = 0; i < stringPlayerTeam.length; i++) {
        if (stringPlayerTeam[i]) {
          console.log(stringPlayerTeam[i]);
          await animate(stringPlayerTeam[i], i + 1);
        }
      }

      for (let i = 0; i < stringEnemyTeam.length; i++) {
        if (stringEnemyTeam[i]) {
          await animate(stringEnemyTeam[i], i + 1);
        }
      }
    } else {
      for (let i = 0; i < stringEnemyTeam.length; i++) {
        if (stringEnemyTeam[i]) {
          await animate(stringEnemyTeam[i], i + 1);
        }
      }

      for (let i = 0; i < stringPlayerTeam.length; i++) {
        if (stringPlayerTeam[i]) {
          await animate(stringPlayerTeam[i], i + 1);
        }
      }
    }

    console.log(data.updateCombat);
    setClientDataHistory([...clientDataHistory, data.updateCombat]);
    setClientData(data.updateCombat);
  }

  if (!props.clientInfo) {
    return <h1>No Party</h1>;
  }
  if (playerTeamVitalEnergy + enemyTeamVitalEnergy === 0) {
    return 'DRAW';
  }
  if (playerTeamVitalEnergy === 0) {
    return 'DEFEAT';
  }
  if (enemyTeamVitalEnergy === 0) {
    return 'VICTORY';
  }

  return (
    <CombatFrame>
      <h1>
        combat number {clientData.combatInstance.combatId} turn #{' '}
        {clientData.combatInstance.actualTurn} --------
        {clientData.combatInstance.actualTurn % 2
          ? 'first move on Enemies'
          : 'first move on Party'}
      </h1>
      <CombatTeamParty
        clientInfo={clientData}
        clientHistory={clientDataHistory}
        register={register}
        watch={watch}
        active={activeHelden}
        targeted={targetedHelden}
        healed={healedHelden}
      />
      <CombatEnemyTeam
        clientInfo={clientData}
        clientHistory={clientDataHistory}
        register={register}
        watch={watch}
        active={activeEnemy}
        targeted={targetedEnemy}
        healed={healedEnemy}
      />
      <button onClick={handleSubmit(hit)}>submit</button>
    </CombatFrame>
  );
};

export default StoryMode;

export async function getServerSideProps(context) {
  const apolloClient = initializeApollo(null, context);

  const { session: token } = nextCookies(context);
  const loggedIn = await isSessionTokenValid(token);

  if (!(await isSessionTokenValid(token))) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
  await deleteCombatInstance(1);
  const clientInfo = await initializeCombat(1);

  return {
    props: {
      loggedIn,
      clientInfo,
      initialApolloState: apolloClient.cache.extract(),
    },
  };
}
