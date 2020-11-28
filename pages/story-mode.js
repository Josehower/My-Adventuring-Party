import React, { useEffect, useState } from 'react';
import { initializeApollo } from '../apollo/client';
import { isSessionTokenValid } from '../utils/auth';
import nextCookies from 'next-cookies';
import {
  deleteCombatInstance,
  initializeCombat,
} from '../utils/Combat-database';
import styled, { keyframes } from 'styled-components';
import { useForm } from 'react-hook-form';
import CombatTeamParty from '../components/CombatTeamParty';
import CombatEnemyTeam from '../components/CombatEnemyTeam';
import { gql, useMutation } from '@apollo/client';
import { pause } from '../utils/timer';
import { klona } from 'klona';
import VictoryFrame from '../components/VictoryFrame';

const CombatFrame = styled.div`
  display: grid;
  position: relative;
  grid-template-columns: 1fr 1fr;
  background: url(/night.jpg) no-repeat;
  background-color: rgba(0, 0, 0, 0.4);
  background-blend-mode: soft-light;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center bottom;
  border: white 3px solid;
  width: 90vw;
  margin: 0 auto;
  border-radius: 5px;

  h1 {
    grid-column: span 2;
    margin: 1rem;
  }
`;
const MapFrame = styled.div`
  position: relative;
  background: url(/village.png) no-repeat;
  background-color: rgba(0, 0, 0, 0.4);
  background-blend-mode: soft-light;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center bottom;
  background-position: center;
  border: white 3px solid;
  width: 95vw;
  height: 38vw;
  margin: 0 auto;
  border-radius: 5px;

  h1 {
    grid-column: span 2;
    margin: 1rem;
  }
`;

const breatheAnimation = keyframes`
 0% { opacity: 1}
 30% { opacity: 0.8 }
 40% { opacity: 0.7; }
 100% { opacity: 0.6; }
 `;

const BattleButton = styled.button`
  position: absolute;
  left: 9vw;
  top: 6vw;
  width: 6vw;
  height: 6vw;
  border-radius: 50%;
  border: white 2px solid;
  background: linear-gradient(
    180deg,
    rgba(48, 39, 223, 1) 0%,
    rgba(4, 0, 94, 1) 75%
  );

  img {
    width: 3vw;
    height: 3vw;
    animation-name: ${breatheAnimation};
    animation-duration: 0.5s;
    animation-direction: alternate;
    animation-iteration-count: infinite;
  }
`;

const SubmitButton = styled.button`
  width: 60px;
  height: 60px;
  margin: -25px;
  background: linear-gradient(
    180deg,
    rgba(48, 39, 223, 1) 0%,
    rgba(4, 0, 94, 1) 75%
  );
  color: white;
  position: absolute;
  top: 50%;
  left: 48%;
  border-radius: 50%;
  border: white 2px solid;
  ${(props) => (props.styleCode === -1 ? 'display: none;' : '')}

  &:hover, &:active {
    outline: 0;
    transform: scale(1.02);
    box-shadow: 3px 3px black;
    background: linear-gradient(180deg, #261eb8 0%, rgba(4, 0, 94, 1) 75%);
  }
  &:focus {
    outline: 0;
    border: #dddddd 2px solid;
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
      results {
        heldenActionsResults {
          newVe
          targetTeam
        }
        creatureActionsResults {
          newVe
          targetTeam
        }
      }
    }
  }
`;

const StoryMode = (props) => {
  const initialState = klona(props.clientInfo);
  const { register, handleSubmit, errors, watch } = useForm();

  const [clientData, setClientData] = useState(props.clientInfo);
  const [stateChangesQueve, setChangesQueve] = useState([]);

  const [activeEnemy, setActiveEnemy] = useState(0);
  const [activeHelden, setActiveHelden] = useState(0);
  const [targetedEnemy, setTargetedEnemy] = useState([0, '']);
  const [targetedHelden, setTargetedHelden] = useState([0, '']);
  const [healedEnemy, setHealedEnemy] = useState([0, '']);
  const [healedHelden, setHealedHelden] = useState([0, '']);

  const [combatStep, setCombatStep] = useState(0);
  const [teamPriority, setTeamPriority] = useState(['enemy', 'party']);
  const [combatDefinition, setCombatDefinition] = useState();

  const [updateCombat] = useMutation(updateCombatMutation);

  const enemyTeamVitalEnergy = clientData.enemyTeam.reduce((acc, enemy) => {
    return enemy.instanceVe + acc;
  }, 0);
  const playerTeamVitalEnergy = clientData.playerTeam.reduce((acc, helden) => {
    return helden.instanceVe + acc;
  }, 0);

  async function animateAction({
    performerPos,
    targetPos,
    performerFunc,
    targetFunc,
    delta,
  }) {
    //seting the delta

    const damageLog = delta === 0 ? 'N/A' : delta.toString();

    performerFunc(performerPos);
    await pause(400);
    targetFunc([targetPos, damageLog]);
    await pause(200);
    performerFunc(0);
    await pause(200);
    targetFunc([0, '']);
  }

  async function produceAction(action, results) {
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

      if (!results) {
        resolve({ results: null, actions: null });
      }

      resolve({
        animation: {
          performerPos: action.performerPos,
          targetPos: targetPosition,
          performerFunc: PerformerAnimationFunct,
          targetFunc: targetAnimationFunc,
        },
        results: { newVe: results?.newVe, targetTeam, targetPosition },
      });
    });
  }

  function createStateFragment(renderAction, Oldstate) {
    const stateRef = klona(Oldstate);
    if (
      renderAction.results !== null &&
      renderAction.results.targetTeam === 'helden'
    ) {
      const delta =
        renderAction.results.newVe === -1
          ? 'Miss'
          : renderAction.results.newVe -
            stateRef.playerTeam[renderAction.animation.targetPos - 1]
              .instanceVe;

      stateRef.playerTeam[renderAction.animation.targetPos - 1].instanceVe =
        renderAction.results.newVe === -1
          ? stateRef.playerTeam[renderAction.animation.targetPos - 1].instanceVe
          : renderAction.results.newVe;
      const newStateFragment = {
        newState: { ...stateRef },
        animation: { ...renderAction.animation, delta },
      };
      return [newStateFragment, { ...stateRef }];
    } else if (renderAction.results !== null) {
      const delta =
        renderAction.results.newVe === -1
          ? 'Miss'
          : renderAction.results.newVe -
            stateRef.enemyTeam[renderAction.animation.targetPos - 1].instanceVe;

      stateRef.enemyTeam[renderAction.animation.targetPos - 1].instanceVe =
        renderAction.results.newVe === -1
          ? stateRef.enemyTeam[renderAction.animation.targetPos - 1].instanceVe
          : renderAction.results.newVe;
      const newStateFragment = {
        newState: { ...stateRef },
        animation: { ...renderAction.animation, delta },
      };
      return [newStateFragment, { ...stateRef }];
    }
  }

  async function hit({
    enemyTeam: stringEnemyTeam,
    playerTeam: stringPlayerTeam,
  }) {
    if (combatStep === 0) {
      setCombatStep(1);
      return;
    }

    setCombatStep(-1);

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

    const creatureResults = data.updateCombat.results.creatureActionsResults;
    const heldenResults = data.updateCombat.results.heldenActionsResults;
    const rawTeamActions = stringPlayerTeam
      .map((action, index) => {
        if (action === null) {
          return action;
        }
        return { ...action, performerPos: index + 1 };
      })
      .filter((action) => action !== null);
    const rawEnemyActions = stringEnemyTeam
      .map((action, index) => {
        if (action === null) {
          return action;
        }
        return { ...action, performerPos: index + 1 };
      })
      .filter((action) => action !== null);

    const renderActionList = [];
    let clientStateRef = klona(clientData);

    if (isPlayerFirst) {
      for (let i = 0; i < rawTeamActions.length; i++) {
        if (rawTeamActions[i]) {
          const renderAction = await produceAction(
            rawTeamActions[i],
            heldenResults[i],
          );
          const [stateFragment, newStateRef] = createStateFragment(
            renderAction,
            clientStateRef,
          );
          clientStateRef = newStateRef;
          renderActionList.push(stateFragment);
        }
      }

      for (let i = 0; i < rawEnemyActions.length; i++) {
        if (rawEnemyActions[i]) {
          const renderAction = await produceAction(
            rawEnemyActions[i],
            creatureResults[i],
          );
          const [stateFragment, newStateRef] = createStateFragment(
            renderAction,
            clientStateRef,
          );
          clientStateRef = newStateRef;
          renderActionList.push(stateFragment);
        }
      }
    } else {
      //if enemyFirst
      for (let i = 0; i < rawEnemyActions.length; i++) {
        if (rawEnemyActions[i]) {
          const renderAction = await produceAction(
            rawEnemyActions[i],
            creatureResults[i],
          );
          const [stateFragment, newStateRef] = createStateFragment(
            renderAction,
            clientStateRef,
          );
          clientStateRef = newStateRef;
          renderActionList.push(stateFragment);
        }
      }
      for (let i = 0; i < rawTeamActions.length; i++) {
        if (rawTeamActions[i]) {
          const renderAction = await produceAction(
            rawTeamActions[i],
            heldenResults[i],
          );
          const [stateFragment, newStateRef] = createStateFragment(
            renderAction,
            clientStateRef,
          );
          clientStateRef = newStateRef;
          renderActionList.push(stateFragment);
        }
      }
    }

    renderActionList.push({
      animation: false,
      newState: { ...data.updateCombat },
    });
    setChangesQueve(renderActionList);
  }

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (stateChangesQueve.length > 0) {
        const activeAction = stateChangesQueve.shift();
        const activeStateFragment = activeAction.newState;
        setClientData(activeStateFragment);
        setChangesQueve([...stateChangesQueve]);
        if (activeAction.animation) {
          await animateAction(activeAction.animation);
          await pause(800);
        } else {
          setCombatStep(0);
          if (enemyTeamVitalEnergy === 0) {
            await pause(1000);
            setCombatDefinition('victory');
          }
        }
      }
    }, 900);
    return () => clearTimeout(timeout);
  }, [clientData, stateChangesQueve]);

  useEffect(() => {
    props.setPrompt(`    combat turn #
  ${clientData.combatInstance.actualTurn}
  ${
    clientData.combatInstance.actualTurn % 2
      ? 'first move is on Enemies'
      : 'first move is on Party'
  }`);
    clientData.combatInstance.actualTurn % 2
      ? setTeamPriority(['enemy', 'party'])
      : setTeamPriority(['party', 'enemy']);
  }, [clientData]);

  if (!props.clientInfo) {
    return <h1>No Party</h1>;
  }
  if (playerTeamVitalEnergy + enemyTeamVitalEnergy === 0) {
    return 'DRAW';
  }
  if (playerTeamVitalEnergy === 0) {
    return 'DEFEAT';
  }
  if (combatDefinition === 'victory') {
    return <VictoryFrame definition={setCombatDefinition} />;
  }
  if (combatDefinition === 'battleOn') {
    return (
      <CombatFrame>
        <CombatTeamParty
          clientInfo={clientData}
          initialState={initialState}
          register={register}
          watch={watch}
          active={activeHelden}
          targeted={targetedHelden}
          healed={healedHelden}
          combatStep={combatStep}
          teamPriority={teamPriority}
        />
        <CombatEnemyTeam
          clientInfo={clientData}
          initialState={initialState}
          register={register}
          watch={watch}
          active={activeEnemy}
          targeted={targetedEnemy}
          healed={healedEnemy}
          combatStep={combatStep}
          teamPriority={teamPriority}
        />
        <SubmitButton styleCode={combatStep} onClick={handleSubmit(hit)}>
          {teamPriority[combatStep]} Go!
        </SubmitButton>
      </CombatFrame>
    );
  }

  props.setPrompt(
    'Wow... something is happening on the forest!, you should take a look',
  );

  return (
    <MapFrame>
      <BattleButton
        onClick={() => {
          props.setPrompt(
            'wow this dark helden want to take the village by the force. Please defend us!',
          );
          setCombatDefinition('battleOn');
        }}
      >
        <img src="/alert.svg" alt="alert" />
      </BattleButton>
    </MapFrame>
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
