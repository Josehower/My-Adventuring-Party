import { isSessionTokenValid } from '../utils/auth';
import nextCookies from 'next-cookies';
import { getGameByToken } from '../utils/account-database';
import { initializeApollo } from '../apollo/client';
import PlayerBag, { bagQuery } from '../components/PlayerBag';

export default function Home(props) {
  return (
    <div>
      <PlayerBag gameId={props.gameId} messageSetter={props.setPrompt} />
    </div>
  );
}

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
  });

  return {
    props: {
      loggedIn,
      gameId,
      initialApolloState: apolloClient.cache.extract(),
    },
  };
}
