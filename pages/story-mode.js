import React from 'react';
import { initializeApollo } from '../apollo/client';
import { isSessionTokenValid } from '../utils/auth';
import nextCookies from 'next-cookies';
import { initializeCombat } from '../utils/Combat-database';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  gap: 50px;
  img {
    height: 10vh;
  }
`;

const StoryMode = (props) => {
  function hitHandler(instanceId) {
    props.setPrompt(`helden instanceId ${instanceId} has been hitted`);
  }
  return (
    <>
      <h1>combat number {props.clientInfo.combatInstance.combatId}</h1>
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
          <button onClick={() => hitHandler(helden.heldenInstanceId)}>
            Hit
          </button>
        </Wrapper>
      ))}
    </>
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

  const clientInfo = await initializeCombat(1);

  return {
    props: {
      loggedIn,
      clientInfo,
      initialApolloState: apolloClient.cache.extract(),
    },
  };
}
