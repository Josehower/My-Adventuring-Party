import { gql, useMutation, useQuery } from '@apollo/client';
import nextCookies from 'next-cookies';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { initializeApollo } from '../apollo/client';
import { isSessionTokenValid } from '../utils/auth';

// Styles-----------------------

const PartyButton = styled.button`
  background: green;
  color: white;
  border: none;
  border-radius: 5px;
  width: 60px;
`;
const BenchButton = styled.button`
  background: white;
  color: black;
  border: none;
  border-radius: 5px;
  width: 60px;
`;
const DeleteHeldenButton = styled.button`
  background: red;
  color: white;
  border: none;
  padding: 0;
  width: 20px;
  height: 20px;
  border-radius: 5px;
  justify-self: center;
`;

const CreateHeldenForm = styled.form`
  background: rgb(48, 39, 223);
  background: linear-gradient(
    180deg,
    rgba(48, 39, 223, 1) 0%,
    rgba(4, 0, 94, 1) 75%
  );
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  padding: 5px;
  align-items: center;
  height: 9vw;
  font-family: 'VT323', monospace;
  border: white solid 2px;
  border-radius: 5px;
  font-size: 1.5em;

  button {
    grid-column: span 2;
  }
`;

const HeldenButton = styled.button`
  position: absolute;
  transform: rotate(-90deg);
  height: 30px;
  width: 53px;
  /* padding-bottom: 3px; */
  left: -0.525vh;
  top: ${(props) => props.top}vh;
  z-index: 1;
  border: solid 2px white;
  border-radius: 5px;
  color: ${(props) => (props.isClicked ? 'white' : 'gray')};
  background: ${(props) =>
    props.isClicked ? 'rgba(48, 39, 223, 1) 0%;' : 'black'};
`;

const HeldenGrid = styled.div`
  z-index: 0;
  display: grid;
  position: relative;
  padding: 10px;
  align-content: start;
  max-width: 70vw;
  margin: 10px;
  height: 38vw;
  border-radius: 5px;
  gap: 5px;
  background: rgb(48, 39, 223);
  background: linear-gradient(
    180deg,
    rgba(48, 39, 223, 1) 0%,
    rgba(4, 0, 94, 1) 75%
  );
  overflow: auto;

  font-family: 'VT323', monospace;
  border: white solid 2px;
  font-size: 1.5em;
  grid-row: span 3;

  h1 {
    padding: 10px 5px;
    margin: 0;
    max-height: 100px;
    position: sticky;
    top: -10px;
    background: rgb(23, 19, 109);
    border-radius: 5px;
  }

  h1 + div {
    padding: 5px 5px;
    border-radius: 5px;
    position: sticky;
    margin-top: 0;
    gap: 0;
    top: 25px;
    background: rgb(23, 19, 109);
  }

  div {
    display: grid;
    max-height: 60px;
    grid-template-columns: 2fr repeat(9, 1fr) 0.3fr;
    margin-bottom: 5px;
  }
`;

const PartyList = styled.div`
  display: grid;
  padding: 10px;
  height: 38vw;
  margin: 10px;
  border-radius: 5px;
  gap: 5px;
  background: rgb(48, 39, 223);
  background: linear-gradient(
    180deg,
    rgba(48, 39, 223, 1) 0%,
    rgba(4, 0, 94, 1) 75%
  );
  font-family: 'VT323', monospace;
  border: white solid 2px;
  font-size: 2em;
  grid-row: span 3;

  > div {
    align-self: center;
    justify-self: center;
    width: 50vw;
    grid-column: span 2;
    display: grid;
    grid-template-columns: 1fr 2fr;
    padding: 5px;
    margin: 0;
    gap: 3px;
  }

  h1 {
    grid-column: span 2;
    text-align: center;
  }
`;

const HeldenFrame = styled.div`
  display: grid;
  justify-items: center;
  margin: 5px 0;
  padding: 5px;
  gap: 10px;
  border-radius: 5px;
  background: rgb(48, 39, 223);
  background: linear-gradient(
    180deg,
    rgba(48, 39, 223, 1) 0%,
    rgba(4, 0, 94, 1) 75%
  );
  font-family: 'VT323', monospace;
  border: white solid 2px;
  font-size: 1.5em;
  grid-row: span 2;

  button {
    margin-left: 10px;
    background: transparent;
    color: white;
    border: solid 2px transparent;
    border-radius: 5px;

    &:hover {
      border: solid 2px white;
    }
  }

  h2 {
    margin: 0;
  }
`;
const StatDiv = styled.div`
  justify-self: stretch;
  display: flex;
  justify-content: space-around;
`;

const HeldenImage = styled.img`
  height: 10vw;
`;

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  grid-template-rows: 2fr 1fr 1fr;
`;

const Error = styled.div`
  color: red;
  margin: 0;
  display: inline;
`;

const HeldenRow = styled.div`
  background: ${(props) => (props.active ? 'black' : 'transparent')};
  padding: 5px 5px;
  cursor: pointer;
`;

//  Mutations and Queries-----------------------

const expeditionListQuery = gql`
  query expeditionList {
    expeditionList {
      name
      expeditionStartDate
      gameId
      lvlLevel
      heldenId
      className
      classImage
    }
  }
`;

const veUpgradeFromItemMutation = gql`
  mutation itemVeUpgrade($heldenId: Int!, $amount: Int) {
    itemVeUpgrade(heldenId: $heldenId, amount: $amount) {
      message
    }
  }
`;
const apUpgradeFromItemMutation = gql`
  mutation itemApUpgrade($heldenId: Int!, $amount: Int) {
    itemApUpgrade(heldenId: $heldenId, amount: $amount) {
      message
    }
  }
`;
const pdUpgradeFromItemMutation = gql`
  mutation itemPdUpgrade($heldenId: Int!, $amount: Int) {
    itemPdUpgrade(heldenId: $heldenId, amount: $amount) {
      message
    }
  }
`;
const sdUpgradeFromItemMutation = gql`
  mutation itemSdUpgrade($heldenId: Int!, $amount: Int) {
    itemSdUpgrade(heldenId: $heldenId, amount: $amount) {
      message
    }
  }
`;

const deleteHeldenMutation = gql`
  mutation deleteHelden($heldenId: Int!) {
    deleteHelden(heldenId: $heldenId) {
      message
    }
  }
`;

const createHeldenMutation = gql`
  mutation createHelden($name: String!, $className: String!) {
    createHelden(name: $name, className: $className) {
      message
    }
  }
`;

const heldenToBenchMutation = gql`
  mutation heldenToBench($heldenId: Int!) {
    heldenToBench(heldenId: $heldenId) {
      message
    }
  }
`;
const heldenToPartyMutation = gql`
  mutation heldenToParty($heldenId: Int!, $position: Int!) {
    heldenToParty(heldenId: $heldenId, position: $position) {
      message
    }
  }
`;

export const heldenListQuery = gql`
  query heldenList {
    heldenList {
      name
      class {
        className
        classImg
      }
      id
      lvl
      exs
      sa
      stats {
        ve
        ap
        sd
        pd
      }
      partySlot
    }
  }
`;

// Component declaration-----------------------

const HeldenManager = ({ setPrompt }) => {
  const [isHeldenBoxVisible, setIsHeldenBoxVisible] = useState(true);

  const [party, setParty] = useState(new Array(5).fill(null));
  const [active, setActive] = useState(0);

  const { register, handleSubmit, errors } = useForm();

  // Component queries-----------------------

  const {
    data: { expeditionList },
    _loading,
    _error,
    refetch,
  } = useQuery(expeditionListQuery);
  console.log('expe', expeditionList);
  const {
    data: { heldenList: heldenListData },
    loading,
    error,
  } = useQuery(heldenListQuery);

  // Component mutations-----------------------

  const [itemVeUpgrade] = useMutation(veUpgradeFromItemMutation, {
    refetchQueries: [
      {
        query: heldenListQuery,
      },
    ],
  });

  const [itemApUpgrade] = useMutation(apUpgradeFromItemMutation, {
    refetchQueries: [
      {
        query: heldenListQuery,
      },
    ],
  });

  const [itemSdUpgrade] = useMutation(sdUpgradeFromItemMutation, {
    refetchQueries: [
      {
        query: heldenListQuery,
      },
    ],
  });

  const [itemPdUpgrade] = useMutation(pdUpgradeFromItemMutation, {
    refetchQueries: [
      {
        query: heldenListQuery,
      },
    ],
  });

  const [heldenToBench] = useMutation(heldenToBenchMutation, {
    refetchQueries: [
      {
        query: heldenListQuery,
      },
    ],
  });

  const [heldenToParty] = useMutation(heldenToPartyMutation, {
    refetchQueries: [
      {
        query: heldenListQuery,
      },
    ],
  });

  const [createHelden] = useMutation(createHeldenMutation, {
    refetchQueries: [
      {
        query: heldenListQuery,
      },
    ],
  });

  const [deleteHelden] = useMutation(deleteHeldenMutation, {
    refetchQueries: [
      {
        query: heldenListQuery,
      },
    ],
  });

  // Component handlers-----------------------

  async function onSubmit({ heldenName, className }) {
    const { data } = await createHelden({
      variables: { name: heldenName.toLowerCase(), className: className },
    });

    const { message } = data.createHelden;
    setPrompt(message);
  }

  async function upgradeVe(heldenId) {
    //  schema---> mutation itemVeUpgrade($heldenId: Int!, $amount: Int)
    const { data } = await itemVeUpgrade({
      variables: { heldenId: heldenId },
    });

    const { message } = data.itemVeUpgrade;
    setPrompt(message);
  }
  async function upgradeAp(heldenId) {
    //  schema---> mutation itemApUpgrade($heldenId: Int!, $amount: Int)
    const { data } = await itemApUpgrade({
      variables: { heldenId: heldenId },
    });

    const { message } = data.itemApUpgrade;
    setPrompt(message);
  }
  async function upgradePd(heldenId) {
    // schema---> mutation itemPdUpgrade($heldenId: Int!, $amount: Int)
    const { data } = await itemPdUpgrade({
      variables: { heldenId: heldenId },
    });

    const { message } = data.itemPdUpgrade;
    setPrompt(message);
  }
  async function upgradeSd(heldenId) {
    // schema---> mutation itemSdUpgrade($heldenId: Int!, $amount: Int)
    const { data } = await itemSdUpgrade({
      variables: { heldenId: heldenId },
    });

    const { message } = data.itemSdUpgrade;
    setPrompt(message);
  }

  async function deleteHeldenHandler(id) {
    const { data } = await deleteHelden({
      variables: { heldenId: id },
    });

    const { message } = data.deleteHelden;
    setPrompt(message);
  }

  async function addToParty(id) {
    const emptyIndex = party.findIndex((helden) => helden === null);
    if (emptyIndex < 0) {
      setPrompt(`ups... your party is FULL!!!`);
      return;
    }
    const emptySpot = emptyIndex + 1;
    const { data } = await heldenToParty({
      variables: { heldenId: id, position: emptySpot },
    });
    const { message } = data.heldenToParty;
    setPrompt(message);
  }

  async function removeFromParty(id) {
    const { data } = await heldenToBench({
      variables: { heldenId: id },
    });
    const { message } = data.heldenToBench;
    setPrompt(message);
  }

  // Error handling and Render declarations-----------------------

  const heldenList = [...heldenListData].sort((a, b) =>
    a.name > b.name ? 1 : -1,
  );

  useEffect(() => {
    const partyList = party.map((slot, index) => {
      const heldenSlot = heldenList.filter(
        (helden) => helden.partySlot === index + 1,
      )[0];
      return heldenSlot ? heldenSlot : null;
    });

    setParty(partyList);
  }, [heldenListData]);

  if (loading) return 'loading...';
  if (error) return `${error}`;

  return (
    <Wrapper>
      <HeldenButton
        top={32}
        isClicked={isHeldenBoxVisible}
        onClick={() => setIsHeldenBoxVisible(true)}
      >
        List
      </HeldenButton>
      <HeldenButton
        top={42}
        isClicked={!isHeldenBoxVisible}
        onClick={() => setIsHeldenBoxVisible(false)}
      >
        Party
      </HeldenButton>
      {isHeldenBoxVisible ? (
        <HeldenGrid>
          <h1>HELDEN LIST</h1>
          <div>
            <div>NAME</div>
            <div>CLASS</div>
            <div>LvL</div>
            <div>ExS</div>
            <div>Sa</div>
            <div>VE</div>
            <div>AP</div>
            <div>SD</div>
            <div>PD</div>
            <div>STATUS</div>
          </div>
          {[...heldenList].map((helden, index) => (
            <HeldenRow
              onClick={() => setActive(index)}
              key={helden.id}
              active={active === index ? 'active' : ''}
            >
              <div>{helden.name}</div>
              <div>{helden.class.className}</div>
              <div>{helden.lvl}</div>
              <div>{helden.exs}</div>
              <div>{helden.sa}</div>
              <div>{helden.stats.ve}</div>
              <div>{helden.stats.ap}</div>
              <div>{helden.stats.sd}</div>
              <div>{helden.stats.pd}</div>
              <div>
                {expeditionList.some(
                  ({ heldenId }) => heldenId === helden.id,
                ) ? (
                  <div>expe</div>
                ) : helden.partySlot ? (
                  <PartyButton onClick={() => removeFromParty(helden.id)}>
                    PARTY
                  </PartyButton>
                ) : (
                  <BenchButton onClick={() => addToParty(helden.id)}>
                    BENCH
                  </BenchButton>
                )}
              </div>
              <DeleteHeldenButton
                onClick={() => deleteHeldenHandler(helden.id)}
              >
                x
              </DeleteHeldenButton>
            </HeldenRow>
          ))}
        </HeldenGrid>
      ) : (
        <PartyList>
          <h1>Helden on party</h1>
          {party.map((helden, index) => {
            if (helden === null) {
              return (
                <div key={index}>{`${
                  index + 1
                } - This party Slot is Empty`}</div>
              );
            } else {
              return (
                <div key={helden.id}>
                  <div>
                    {index + 1} - {helden?.name}
                  </div>
                  <div> {`${helden.class.className} - lvl: ${helden.lvl}`}</div>
                </div>
              );
            }
          })}
        </PartyList>
      )}

      <HeldenFrame>
        <h2>{heldenList[active]?.name}</h2>
        {heldenList[active] ? (
          <HeldenImage
            src={`/helden${heldenList[active]?.class.classImg}`}
            alt={heldenList[active]?.class.className}
          />
        ) : (
          ''
        )}
        <div>
          {heldenList[active]?.class.className} - lvl {heldenList[active]?.lvl}{' '}
          - ID {heldenList[active]?.id}
        </div>
        <div>ExS - {heldenList[active]?.exs}</div>
        <div>Sa - {heldenList[active]?.sa}</div>
        <StatDiv>
          VE - {heldenList[active]?.stats.ve}
          <button onClick={() => upgradeVe(heldenList[active].id)}>
            upgrade
          </button>
        </StatDiv>
        <StatDiv>
          AP - {heldenList[active]?.stats.ap}{' '}
          <button onClick={() => upgradeAp(heldenList[active].id)}>
            upgrade
          </button>
        </StatDiv>
        <StatDiv>
          SD - {heldenList[active]?.stats.sd}{' '}
          <button onClick={() => upgradeSd(heldenList[active].id)}>
            upgrade
          </button>
        </StatDiv>
        <StatDiv>
          PD - {heldenList[active]?.stats.pd}{' '}
          <button onClick={() => upgradePd(heldenList[active].id)}>
            upgrade
          </button>
        </StatDiv>
      </HeldenFrame>
      <CreateHeldenForm onSubmit={handleSubmit(onSubmit)}>
        Helden Name
        <br />
        <input
          name="heldenName"
          ref={register({ required: true })}
          type="text"
        />
        {errors.heldenName && <Error>---{'>'} ups, this is required</Error>}
        Class
        <select
          name="className"
          id="classes"
          ref={register({ required: true })}
        >
          <option value="Warrior">Warrior</option>
          <option value="Healer">Healer</option>
          <option value="Gunner">Gunner</option>
          <option value="Mage">Mage</option>
        </select>
        {errors.className && <Error>---{'>'} ups, this is required</Error>}
        <button>Add New Helden</button>
      </CreateHeldenForm>
    </Wrapper>
  );
};

export default HeldenManager;

// SSP function----------------------

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
  await apolloClient.query({
    query: heldenListQuery,
  });

  await apolloClient.query({
    query: expeditionListQuery,
  });

  return {
    props: {
      loggedIn,
      initialApolloState: apolloClient.cache.extract(),
    },
  };
}
