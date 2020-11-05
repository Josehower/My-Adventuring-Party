import Head from 'next/head';
import GoldContainer from '../components/GoldContainer';
import { isSessionTokenValid } from '../utils/auth';
import nextCookies from 'next-cookies';
import { getGameByToken } from '../utils/account-database';
import {
  getPlayerBagByGameId,
  getPlayerMoneyById,
  getStoreByGameId,
} from '../utils/game-database';
import { useEffect, useState } from 'react';
import MariosStore from '../components/MariosStore';
import PlayerBag from '../components/PlayerBag';
import styled from 'styled-components';
import { useMutation, gql } from '@apollo/client';
import { getErrorMessage } from '../lib/error';

const hitTheBarrelMutation = gql`
  mutation hitTheBarrel($id: Int!) {
    hitTheBarrel(id: $id) {
      message
    }
  }
`;

const Prompt = styled.div`
  background: rgb(48, 39, 223);
  background: linear-gradient(
    180deg,
    rgba(48, 39, 223, 1) 0%,
    rgba(4, 0, 94, 1) 75%
  );
  color: #eeeeee;
  height: 10vh;
  margin: 10px;
  padding: 0.5em;
  border-radius: 5px;
  border: 5px solid gray;
`;

export default function Home(props) {
  const [hitTheBarrel] = useMutation(hitTheBarrelMutation);
  const [barrelAmount, setBarrelAmount] = useState(0);
  const [gold, setGold] = useState(props.gold);
  const [soulStones, setSoulStones] = useState(props.soulStones);
  const [lastBarrelHit, setLastBarrelHit] = useState(props.lastBarrelHit);
  const [prompt, setPrompt] = useState('Welcome to my adventuring party');

  function updateBarrel() {
    const reference = +Date.now();
    const barrelCurrentAmount = Math.floor(
      (reference - lastBarrelHit) / 1000 / 5,
    );
    if (barrelCurrentAmount > 500) {
      setBarrelAmount(500);
    } else {
      setBarrelAmount(barrelCurrentAmount);
    }
  }

  async function hitBarrel() {
    const { data } = await hitTheBarrel({
      variables: {
        id: props.gameId,
      },
    });
    const { message } = data.hitTheBarrel;
    setPrompt(message);
    const hitDate = +new Date();
    setLastBarrelHit(hitDate);
    updateBarrel();
  }

  useEffect(() => {
    const barrel = setInterval(() => {
      updateBarrel();
    }, 100);
    return () => clearInterval(barrel);
  }, [lastBarrelHit]);

  return (
    <div>
      <Head>
        <title>Prototype</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <br />
      <Prompt>{prompt}</Prompt>
      <br />
      nick: {props.nick}
      <br />
      <GoldContainer
        barrel={barrelAmount}
        hitBarrel={hitBarrel}
        gold={gold}
        setGold={setGold}
        soulStones={soulStones}
        setSoulStones={setSoulStones}
      />
      <br />
      <div>
        <MariosStore store={props.store} messageSetter={setPrompt} />
        <br />
        <PlayerBag
          bag={props.bag}
          nick={props.nick}
          messageSetter={setPrompt}
        />
        <br />
        <div>EXPEDITIONS</div>
        <br />
        <div>HELDEN</div>
        <br />
        <div>STORY MODE</div>
        <br />
        <div>PVP</div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
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
  const playerMoney = await getPlayerMoneyById(gameId);
  const bag = await getPlayerBagByGameId(gameId);
  const store = await getStoreByGameId(gameId);
  const lastBarrelHit = +playerMoney.lastHit;

  return {
    props: {
      loggedIn,
      gold: playerMoney.gold,
      lastBarrelHit,
      soulStones: playerMoney.soulStones,
      nick: playerMoney.nickName,
      store,
      bag,
      gameId,
    },
  };
}
