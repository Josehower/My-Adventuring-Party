import { useState } from 'react';
import styled from 'styled-components';

const GoldButton = styled.button`
  background: gold;
`;

const GoldContainer = ({ barrel, hitBarrel, gold, setGold, soulStones }) => {
  function barrelHandler() {
    setGold(gold + barrel);
    hitBarrel();
  }
  return (
    <div>
      barrel - {barrel}
      <GoldButton onClick={barrelHandler}>hitMe</GoldButton>
      <br />$ - {gold}
      <br />§ - {soulStones}
    </div>
  );
};

export default GoldContainer;
