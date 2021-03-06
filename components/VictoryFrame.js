import { gql, useMutation } from '@apollo/client';
import React, { useEffect } from 'react';
import styled from 'styled-components';

const deleteCombatMutation = gql`
  mutation deleteCombat {
    deleteCombat {
      message
    }
  }
`;

const Frame = styled.div`
  width: 50vw;
  height: 50vh;
  font-family: 'VT323', monospace;
  font-size: 1.8em;
  margin: 40px auto;
  background: linear-gradient(
    180deg,
    rgba(48, 39, 223, 1) 0%,
    rgba(4, 0, 94, 1) 75%
  );
  color: white;
  border-radius: 5px;
  border: white 2px solid;
  padding: 2rem;
  text-align: center;

  h3 {
    margin-bottom: 3px;
  }

  li {
    text-decoration: none;
    list-style: none;
    margin: 0;
  }
`;

const VictoryFrame = (props) => {
  const [deleteCombat] = useMutation(deleteCombatMutation);

  async function resetCombat() {
    props.definition('');
    const { data } = await deleteCombat();
    console.log(data.deleteCombat);
  }

  useEffect(() => {
    async function reset() {
      const { data } = await deleteCombat();
      console.log(data.deleteCombat);
    }
    reset();
  }, []);

  return (
    <Frame>
      <h1>CONGRATULATIONS ADVENTURER</h1>
      <hr />
      <h2>you Won this fight!</h2>
      <hr />
      <h3>this are your rewards:</h3>
      <ul>
        <li>2 Basic Potion</li>
        <li>300 gold</li>
      </ul>
      <button onClick={resetCombat}>back</button>
    </Frame>
  );
};

export default VictoryFrame;
