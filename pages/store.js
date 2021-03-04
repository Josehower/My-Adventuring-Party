import { gql } from '@apollo/client';
import nextCookies from 'next-cookies';
import React from 'react';
import styled from 'styled-components';
import { initializeApollo } from '../apollo/client';
import MariosStore, { getStoreQuerry } from '../components/MariosStore';
import PlayerBag, { bagQuery } from '../components/PlayerBag';
import { isSessionTokenValid } from '../utils/auth';

const StoreWarpper = styled.div`
  margin: 0 auto;
  display: grid;
  justify-content: center;
`;

const store = ({ setPrompt }) => {
  return (
    <StoreWarpper>
      <MariosStore messageSetter={setPrompt} />
      <PlayerBag messageSetter={setPrompt} />
    </StoreWarpper>
  );
};

export default store;

export async function getServerSideProps(context) {
  const apolloClient = initializeApollo(null, context);

  const { session: token } = nextCookies(context);
  const loggedIn = await isSessionTokenValid(token);

  if (!(await loggedIn)) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }


  const {
    data: { isCombatActive },
  } = await apolloClient.query({
    query: gql`
      query {
        isCombatActive
      }
    `,
  });

  if (isCombatActive) {
    return {
      redirect: {
        destination: '/story-mode',
        permanent: false,
      },
    };
  }


  await apolloClient.query({
    query: bagQuery,
  });

  await apolloClient.query({
    query: getStoreQuerry,
  });

  return {
    props: {
      loggedIn,
      initialApolloState: apolloClient.cache.extract(),
    },
  };
}
