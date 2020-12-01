import React from 'react';
import { initializeApollo } from '../apollo/client';
import PlayerBag, { bagQuery } from '../components/PlayerBag';
import { isSessionTokenValid } from '../utils/auth';
import nextCookies from 'next-cookies';
import MariosStore, { getStoreQuerry } from '../components/MariosStore';
import styled from 'styled-components';

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

  if (!(await isSessionTokenValid(token))) {
    return {
      redirect: {
        destination: '/login',
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
