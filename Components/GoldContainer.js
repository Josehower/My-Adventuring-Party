import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useMutation, gql, useQuery } from '@apollo/client';

const MoneyWrapper = styled.div`
  display: flex;
  justify-content: space-around;
  font-family: 'VT323', monospace;
  font-size: 1.4em;

  div {
    max-width: 180px;
  }
`;

const GoldButton = styled.button`
  background: gold;
  margin-right: 8px;
`;

const hitTheBarrelMutation = gql`
  mutation hitTheBarrel {
    hitTheBarrel {
      message
    }
  }
`;

export const moneyQuery = gql`
  query playerMoney {
    playerMoney {
      nickName
      lastHitJson
      gold
      soulStones
    }
  }
`;

const GoldContainer = ({ setPrompt = console.log, isPlayerLogged }) => {
  const {
    data: money,
    loading: moneyQuerryLoading,
    error: moneyQuerryError,
  } = useQuery(moneyQuery, {
    pollInterval: 500,
  });

  const [hitTheBarrel] = useMutation(hitTheBarrelMutation);

  const [barrelAmount, setBarrelAmount] = useState(0);
  const [lastBarrelHit, setLastBarrelHit] = useState(+Date.now());

  if (money && money?.playerMoney.lastHitJson !== lastBarrelHit) {
    setLastBarrelHit(money?.playerMoney.lastHitJson);
  }

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
    const { data } = await hitTheBarrel();
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
  }, [money]);

  if (!isPlayerLogged) {
    return '';
  }
  if (moneyQuerryError) {
    return <p>{`${moneyQuerryError}`}</p>;
  }
  if (moneyQuerryLoading) {
    return <p>{'loading...'}</p>;
  }

  return (
    <MoneyWrapper>
      <div>
        <GoldButton onClick={() => hitBarrel()}>hitMe</GoldButton>
        barrel: ${barrelAmount}
      </div>
      <div>gold: $ {money?.playerMoney.gold} </div>
      <div>soul stones: § {money?.playerMoney.soulStones}</div>
      <div>Player: {money?.playerMoney.nickName}</div>
    </MoneyWrapper>
  );
};

export default GoldContainer;
