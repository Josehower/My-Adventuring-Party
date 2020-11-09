import React from 'react';
import { initializeApollo } from '../apollo/client';
import PlayerBag, { bagQuery } from '../components/PlayerBag';
import { isSessionTokenValid } from '../utils/auth';
import nextCookies from 'next-cookies';
import { getGameByToken } from '../utils/account-database';
import MariosStore, { getStoreQuerry } from '../components/MariosStore';
import { getStoreByGameId } from '../utils/game-database';

const store = ({ gameId, setPrompt }) => {
  return (
    <div>
      <MariosStore messageSetter={setPrompt} gameId={gameId} />
      <PlayerBag gameId={gameId} messageSetter={setPrompt} />
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
  const gameInstance = await getGameByToken(token);
  const gameId = gameInstance.gameId;

  await apolloClient.query({
    query: bagQuery,
    variables: { gameId: gameId },
  });

  await apolloClient.query({
    query: getStoreQuerry,
    variables: { id: gameId },
  });

  const store = await getStoreByGameId(gameId);

  console.log(apolloClient.cache.extract());

  return {
    props: {
      loggedIn,
      store,
      gameId,
      initialApolloState: apolloClient.cache.extract(),
    },
  };
}
