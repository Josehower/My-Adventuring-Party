import { gql, useMutation, useQuery } from '@apollo/client';
import React from 'react';
import { initializeApollo } from '../apollo/client';
import { isSessionTokenValid } from '../utils/auth';
import nextCookies from 'next-cookies';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';

const Wrapper = styled.div`
  display: flex;
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

  h1 {
    margin: 10px 5px;
  }

  div {
    display: grid;
    grid-template-columns: 2fr repeat(10, 1fr);
    margin-bottom: 5px;
  }
`;

const createHeldenMutation = gql`
  mutation createHelden($name: String!, $className: String!) {
    createHelden(name: $name, className: $className) {
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

const store = ({ setPrompt }) => {
  const { register, handleSubmit, errors } = useForm();

  const {
    data: { heldenList },
    loading,
    error,
  } = useQuery(heldenListQuery);

  const [createHelden] = useMutation(createHeldenMutation, {
    refetchQueries: [
      {
        query: heldenListQuery,
      },
    ],
  });

  async function onSubmit({ heldenName, className }) {
    const { data } = await createHelden({
      variables: { name: heldenName, className: className },
    });

    const { message } = data.createHelden;
    setPrompt(message);
  }

  async function deleteHelden(id) {
    console.log(id);
  }

  if (loading) return 'loading...';
  if (error) return `${error}`;

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
          <div>EV</div>
          <div>AP</div>
          <div>SD</div>
          <div>PD</div>
          <div>STATUS</div>
        </div>
        {heldenList.map((helden) => (
          <div key={helden.id}>
            <div>{helden.name}</div>
            <div>{helden.class.className}</div>
            <div>{helden.lvl}</div>
            <div>{helden.exs}</div>
            <div>{helden.sa}</div>
            <div>{helden.stats.ve}</div>
            <div>{helden.stats.ap}</div>
            <div>{helden.stats.sd}</div>
            <div>{helden.stats.pd}</div>
            <div>{helden.partySlot ? 'ON PARTY' : 'READY'}</div>
            <button onClick={() => deleteHelden(helden.id)}>X</button>
          </div>
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
        <input
          name="className"
          ref={register({ required: true })}
          type="text"
        />
        {errors.className && <Error>---{'>'} ups, this is required</Error>}
        <br />
        <br />
        <button>Add New Helden</button>
      </form>
    </Wrapper>
  );
};

export default store;

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
