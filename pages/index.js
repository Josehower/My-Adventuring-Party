import { gql, useQuery } from '@apollo/client';
import nextCookies from 'next-cookies';
import styled from 'styled-components';
import { initializeApollo } from '../apollo/client';
import PlayerBag, { bagQuery } from '../components/PlayerBag';
import { getGameByToken } from '../utils/account-database';
import { isSessionTokenValid } from '../utils/auth';

const HomeWrapper = styled.div`
  display: grid;
  margin: 0 auto;
  width: 88vw;
  justify-content: center;
  align-items: stretch;
  grid-template-columns: 1fr 4fr;
  grid-template-rows: 1fr;
  gap: 5px;
`;

const ModifiedBag = styled(PlayerBag)`
  width: auto;
  margin: 0;
`;

const InfoBlock = styled.div`
  background: rgb(48, 39, 223);
  background: linear-gradient(
    180deg,
    rgba(48, 39, 223, 1) 0%,
    rgba(4, 0, 94, 1) 75%
  );
  padding: 10px;
  font-family: 'VT323', monospace;
  border: white solid 2px;
  border-radius: 5px;
  font-size: 1.5em;
  li {
    list-style: none;
  }
`;

const LiInfo = styled.div`
  background: black;
  padding: 3px 10px;
  margin: 0;
  border-radius: 5px;
  margin: 4px 0;
`;

export const playerMoneyQuerry = gql`
  query playerMoney {
    playerMoney {
      nickName
      gold
      soulStones
      lastHit
      playerName
      eMail
    }
  }
`;

export default function Home(props) {
  const { data, loading, error } = useQuery(playerMoneyQuerry);

  return (
    <HomeWrapper>
      <InfoBlock>
        <ul>
          <li> Player:</li>
          <LiInfo> {data.playerMoney.playerName}</LiInfo>
          <li> Email: </li>
          <LiInfo> {data.playerMoney.eMail}</LiInfo>
          <li> Nick: </li>
          <LiInfo> {data.playerMoney.nickName}</LiInfo>
          <li> Gold:</li>
          <LiInfo> {data.playerMoney.gold}</LiInfo>
          <li> Soul-Stones: </li>
          <LiInfo> {data.playerMoney.soulStones}</LiInfo>
        </ul>
      </InfoBlock>
      <ModifiedBag
        gameId={props.gameId}
        messageSetter={props.setPrompt}
        className={'abc'}
      />
    </HomeWrapper>
  );
}

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
  const gameInstance = await getGameByToken(token);
  const gameId = gameInstance.gameId;

  await apolloClient.query({
    query: bagQuery,
  });
  await apolloClient.query({
    query: playerMoneyQuerry,
  });

  return {
    props: {
      loggedIn,
      gameId,
      initialApolloState: apolloClient.cache.extract(),
    },
  };
}
