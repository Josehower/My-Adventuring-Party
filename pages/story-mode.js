import React from 'react';
import { initializeApollo } from '../apollo/client';
import { isSessionTokenValid } from '../utils/auth';
import nextCookies from 'next-cookies';
import {
  deleteCombatInstance,
  initializeCombat,
} from '../utils/Combat-database';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';

const CombatFrame = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;

  h1 {
    grid-column: span 2;
  }
`;

const Wrapper = styled.div`
  display: flex;
  gap: 50px;
  img {
    /* filter: hue-rotate(230deg); */
    height: 10vh;
    transform: scale(-1, 1);
  }
`;
const EnemyWrapper = styled.div`
  display: flex;
  gap: 50px;
  img {
    filter: hue-rotate(230deg);
    height: 10vh;
  }
`;

const StoryMode = (props) => {
  const { register, handleSubmit, errors, watch } = useForm();

  function hit(hitPoints) {

    console.log(hitPoints)
  }

  if (!props.clientInfo) {
    return <h1>No Party</h1>;
  }
  return (
    <CombatFrame>
      <h1>combat number {props.clientInfo.combatInstance.combatId}</h1>
      <div>
        {props.clientInfo.playerTeam.map((helden) => (
          <Wrapper>
            <div>
              <h2 key={helden.heldenId}>
                {helden.name} {helden.class.className}
              </h2>
              <img
                src={`/helden${helden.class.classImg}`}
                alt={helden.class.className}
              />
            </div>
            <div>
              <h3>VE: {helden.instanceVe}</h3>
              <h3>SA: {helden.saAvaliable}</h3>
              <h3>AP: {helden.ap}</h3>
              <h3>PD: {helden.pd}</h3>
              <h3>SD: {helden.sd}</h3>
            </div>
            {helden.instanceVe <= 0 ? (
              ''
            ) : (
              <form name="actions">
                <select
                  name={`playerTeam.${helden.slotPosition}.action`}
                  id={`action-${helden.heldenInstanceId}`}
                  ref={register({ required: true })}
                >
                  {helden.actions.map((action) => (
                    <option
                      selected={action.name === 'basic attack' ? true : false}
                      value={action.actionId}
                    >
                      {action.name}
                    </option>
                  ))}
                </select>

                <select
                  name={`playerTeam.${helden.slotPosition}.target`}
                  id={`target-${helden.heldenInstanceId}`}
                  ref={register({ required: true })}
                >
                  {helden.actions.find((action) => {
                    const basicId = helden.actions
                      .find((action) => action.name === 'basic attack')
                      .actionId.toString(10);
                    return (
                      action.actionId.toString(10) ===
                      watch(`playerTeam.${helden.slotPosition}.action`, basicId)
                    );
                  })?.target === 'enemy'
                    ? props.clientInfo.enemyTeam.map((creature) => {
                        return (
                          <option value={creature.creatureInstanceId}>
                            {creature.name} {creature.slotPosition}
                          </option>
                        );
                      })
                    : props.clientInfo.playerTeam.map((helden) => {
                        return (
                          <option value={helden.heldenInstanceId}>
                            {helden.name} {helden.slotPosition}
                          </option>
                        );
                      })}
                </select>
                <input
                  name={`playerTeam.${helden.slotPosition}.heldenInstanceId`}
                  id={`helden-${helden.heldenInstanceId}`}
                  ref={register()}
                  type="hidden"
                  value={helden.heldenInstanceId}
                ></input>
              </form>
            )}
          </Wrapper>
        ))}
      </div>
      <div>
        {props.clientInfo.enemyTeam.map((creature) => (
          <EnemyWrapper>
            <div>
              <h2 key={creature.creatureId}>
                {creature.name} {creature.slotPosition}
              </h2>
              <img
                src={`/creatures${creature.type.typeImage}`}
                alt={creature.type.typeName}
              />
            </div>
            <div>
              <h3>VE: {creature.instanceVe}</h3>
              <h3>SA: {creature.saAvaliable}</h3>
              <h3>AP: {creature.ap}</h3>
              <h3>PD: {creature.pd}</h3>
              <h3>SD: {creature.sd}</h3>
            </div>
            {creature.instanceVe <= 0 ? (
              ''
            ) : (
              <form name="actions">
                <select
                  name={`enemyTeam.${creature.slotPosition}.action`}
                  id={`action-${creature.creatureInstanceId}`}
                  ref={register({ required: true })}
                >
                  {creature.actions.map((action) => (
                    <option
                      selected={action.name === 'basic attack' ? true : false}
                      value={action.actionId}
                    >
                      {action.name}
                    </option>
                  ))}
                </select>
                <select
                  name={`enemyTeam.${creature.slotPosition}.target`}
                  id={`targetHelden-${creature.creatureInstanceId}`}
                  ref={register({ required: true })}
                >
                  {creature.actions.find((action) => {
                    const basicId = creature.actions
                      .find((action) => action.name === 'basic attack')
                      .actionId.toString(10);
                    return (
                      action.actionId.toString(10) ===
                      watch(
                        `enemyTeam.${creature.slotPosition}.action`,
                        basicId,
                      )
                    );
                  })?.target === 'enemy'
                    ? props.clientInfo.playerTeam.map((helden) => {
                        return (
                          <option value={helden.heldenInstanceId}>
                            {helden.name} {helden.slotPosition}
                          </option>
                        );
                      })
                    : props.clientInfo.enemyTeam.map((creature) => {
                        return (
                          <option value={creature.creatureInstanceId}>
                            {creature.name} {creature.slotPosition}
                          </option>
                        );
                      })}
                </select>
                <input
                  name={`enemyTeam.${creature.slotPosition}.creatureInstanceId`}
                  id={`creature-${creature.creatureInstanceId}`}
                  ref={register()}
                  type="hidden"
                  value={creature.creatureInstanceId}
                ></input>
              </form>
            )}
          </EnemyWrapper>
        ))}
      </div>
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
