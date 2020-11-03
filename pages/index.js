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

export default function Home(props) {
  const [barrelAmount, setBarrelAmount] = useState(0);
  const [gold, setGold] = useState(props.gold);
  const [soulStones, setSoulStones] = useState(props.soulStones);
  const [lastBarrelHit, setLastBarrelHit] = useState(props.lastBarrelHit);

  function updateBarrel(test, lastHit) {
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

  function hitBarrel() {
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
        <MariosStore store={props.store} />
        <br />
        <PlayerBag bag={props.bag} nick={props.nick} />
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
  const store = await getStoreByGameId(gameId);
  const bag = await getPlayerBagByGameId(gameId);
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
    },
  };
}
