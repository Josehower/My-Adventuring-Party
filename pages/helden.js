import { gql, useMutation, useQuery } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import { initializeApollo } from '../apollo/client';
import { isSessionTokenValid } from '../utils/auth';
import nextCookies from 'next-cookies';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';

//Styles-----------------------

const HeldenFrame = styled.div`
  padding: 10px;
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
  font-size: 1.5em;
  grid-row: span 2;
`;

const HeldenImage = styled.img`
  height: 20vh;
`;

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: auto auto;
`;

const Error = styled.div`
  color: red;
  margin: 0;
  display: inline;
`;

const HeldenGrid = styled.div`
  display: grid;
  padding: 10px;
  max-width: 70vw;
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
  font-size: 1.5em;
  grid-row: span 2;

  h1 {
    margin: 10px 5px;
  }

  div {
    display: grid;
    grid-template-columns: 2fr repeat(10, 1fr);
    margin-bottom: 5px;
  }
`;

const HeldenRow = styled.div`
  background: ${(props) => (props.active ? 'black' : 'transparent')};
`;

//Mutations and Queries-----------------------

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

const heldenListQuery = gql`
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

//Component declaration-----------------------

const HeldenManager = ({ setPrompt }) => {
  const [party, setParty] = useState(new Array(5).fill(null));
  const [active, setActive] = useState(0);

  const { register, handleSubmit, errors } = useForm();

  //Component queries-----------------------

  const {
    data: { heldenList: heldenListData },
    loading,
    error,
  } = useQuery(heldenListQuery);

  //Component mutations-----------------------

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

  //Component handlers-----------------------

  async function onSubmit({ heldenName, className }) {
    const { data } = await createHelden({
      variables: { name: heldenName.toLowerCase(), className: className },
    });

    const { message } = data.createHelden;
    setPrompt(message);
  }

  async function upgradeVe(heldenId) {
    // schema---> mutation itemVeUpgrade($heldenId: Int!, $amount: Int)
    const { data } = await itemVeUpgrade({
      variables: { heldenId: heldenId },
    });

    const { message } = data.itemVeUpgrade;
    setPrompt(message);
  }
  async function upgradeAp(heldenId) {
    // schema---> mutation itemApUpgrade($heldenId: Int!, $amount: Int)
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

  //Error handling and Render declarations-----------------------

  if (loading) return 'loading...';
  if (error) return `${error}`;

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

  return (
    <Wrapper>
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
              {helden.partySlot ? (
                <button onClick={() => removeFromParty(helden.id)}>
                  PARTY
                </button>
              ) : (
                <button onClick={() => addToParty(helden.id)}>BENCH</button>
              )}
            </div>
            <button onClick={() => deleteHeldenHandler(helden.id)}>X</button>
          </HeldenRow>
        ))}
      </HeldenGrid>
      <form onSubmit={handleSubmit(onSubmit)}>
        Helden Name
        <br />
        <input
          name="heldenName"
          ref={register({ required: true })}
          type="text"
        />
        {errors.heldenName && <Error>---{'>'} ups, this is required</Error>}
        <br />
        Class
        <br />
        <select name="className" id="cars" ref={register({ required: true })}>
          <option value="Warrior">Warrior</option>
          <option value="Healer">Healer</option>
          <option value="Gunner">Gunner</option>
          <option value="Mage">Mage</option>
        </select>
        {errors.className && <Error>---{'>'} ups, this is required</Error>}
        <br />
        <br />
        <button>Add New Helden</button>
      </form>
      <HeldenFrame>
        <h2>{heldenList[active]?.name}</h2>
        <br />
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
        <div>
          VE - {heldenList[active]?.stats.ve}
          <button onClick={() => upgradeVe(heldenList[active].id)}>
            upgrade
          </button>
        </div>
        <div>
          AP - {heldenList[active]?.stats.ap}{' '}
          <button onClick={() => upgradeAp(heldenList[active].id)}>
            upgrade
          </button>
        </div>
        <div>
          SD - {heldenList[active]?.stats.sd}{' '}
          <button onClick={() => upgradeSd(heldenList[active].id)}>
            upgrade
          </button>
        </div>
        <div>
          PD - {heldenList[active]?.stats.pd}{' '}
          <button onClick={() => upgradePd(heldenList[active].id)}>
            upgrade
          </button>
        </div>
      </HeldenFrame>
      <div>
        <h1>Helden on party</h1>
        {party.map((helden, index) => {
          if (helden === null) {
            return (
              <div key={index}>{`${index + 1} - This party Slot is Empty`}</div>
            );
          } else {
            return (
              <div key={helden.id}>{`${index + 1} - ${helden?.name}`}</div>
            );
          }
        })}
      </div>
    </Wrapper>
  );
};

export default HeldenManager;

//SSP function----------------------

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

  await apolloClient.query({
    query: heldenListQuery,
  });

  return {
    props: {
      loggedIn,
      initialApolloState: apolloClient.cache.extract(),
    },
  };
}
