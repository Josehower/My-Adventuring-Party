import React from 'react';
import { initializeApollo } from '../apollo/client';
import PlayerBag, { bagQuery } from '../components/PlayerBag';
import { isSessionTokenValid } from '../utils/auth';
import nextCookies from 'next-cookies';
import MariosStore, { getStoreQuerry } from '../components/MariosStore';

const store = ({ setPrompt }) => {
  return (
    <div>
      <MariosStore messageSetter={setPrompt} />
      <PlayerBag messageSetter={setPrompt} />
    </div>
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
