import { gql, useMutation } from '@apollo/client';
import React from 'react';
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

const DefeatFrame = (props) => {
  const [deleteCombat] = useMutation(deleteCombatMutation);

  async function resetCombat() {
    props.definition('');
    const { data } = await deleteCombat();
    console.log(data.deleteCombat);
  }

  return (
    <Frame>
      <h1>SORRY YOUR TEAM WAS NOT STRONG ENOUGH</h1>
      <hr />
      <h2>you lost this fight!</h2>
      <hr />
      <h3>but dont worry you have infinite lifes XD</h3>

      <button onClick={resetCombat}>back</button>
    </Frame>
  );
};

export default DefeatFrame;
