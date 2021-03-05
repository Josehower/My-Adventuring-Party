import { gql, useMutation, useQuery } from '@apollo/client';
import nextCookies from 'next-cookies';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { initializeApollo } from '../apollo/client';
import HeldenExpeditionCard from '../components/HeldenExpeditionCard';
import { isSessionTokenValid } from '../utils/auth';
import { heldenListQuery } from './helden';

const CardWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 5px;
`;

const Select = styled.select`
  pointer-events: ${(props) => (props.activeExpAmount > 4 ? 'none' : 'all')};
  cursor: ${(props) => (props.activeExpAmount > 4 ? 'not-allowed' : 'pointer')};
  background: ${(props) => (props.activeExpAmount > 4 ? 'gray' : 'white')};
`;

const Form = styled.form`
  display: grid;
  gap: 10px;
  margin: 0 auto;
  width: 70vw;
  grid-template-columns: repeat(2, 1fr);
  grid-column: span 5;

  button {
    border-radius: 5px;
    gap: 5px;
    border: white solid 2px;

    &:hover {
      background: gray;
      color: white;
    }
  }

  select {
    background: linear-gradient(
      180deg,
      rgba(48, 39, 223, 1) 0%,
      rgba(4, 0, 94, 1) 75%
    );
    color: white;
    font-family: 'VT323', monospace;
    font-size: 1.5rem;
    border-radius: 5px;
    gap: 5px;
    border: white solid 2px;

    option {
      background: #3027df;
      /*   background: linear-gradient(
        180deg,
        rgba(48, 39, 223, 1) 0%,
        rgba(4, 0, 94, 1) 75%
      ); */
    }
  }
`;

const SubmitButton = styled.button`
  cursor: ${(props) => (props.activeExpAmount > 4 ? 'not-allowed' : 'pointer')};
  background: ${(props) => (props.activeExpAmount > 4 ? 'gray' : 'white')};
`;

const createExpeditionMutation = gql`
  mutation createExpedition($heldenId: Int!) {
    createExpedition(heldenId: $heldenId) {
      message
    }
  }
`;

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

const Store = (props) => {
  const [createExpedition] = useMutation(createExpeditionMutation, {
    refetchQueries: [
      {
        query: heldenListQuery,
      },
    ],
  });

  const { data, loading, error, refetch } = useQuery(expeditionListQuery);

  const {
    data: { heldenList: heldenListData },
    loading: heldenLoading,
    error: heldenError,
  } = useQuery(heldenListQuery);
  const { register, handleSubmit, errors } = useForm();

  async function onSubmit(submitData) {
   if (submitData.heldenToExpedition === "off" ) return
  
    if (data.expeditionList.length > 4) {
      return;
    }
    const heldenId = parseInt(submitData.heldenToExpedition, 10);
    const {
      data: {
        createExpedition: { message },
      },
    } = await createExpedition({
      variables: { heldenId: heldenId },
    });

    props.setPrompt(message);

    refetch();
  }


  if (loading || heldenLoading) return <p>loading...</p>;
  if (error || heldenError) return `${error}`;

  return (
    <CardWrapper>
      <HeldenExpeditionCard
        data={data}
        heldenListData={heldenListData}
        refetch={refetch}
        slot={0}
      />
      <HeldenExpeditionCard
        data={data}
        heldenListData={heldenListData}
        refetch={refetch}
        slot={1}
      />
      <HeldenExpeditionCard
        data={data}
        heldenListData={heldenListData}
        refetch={refetch}
        slot={2}
      />
      <HeldenExpeditionCard
        data={data}
        heldenListData={heldenListData}
        refetch={refetch}
        slot={3}
      />
      <HeldenExpeditionCard
        data={data}
        heldenListData={heldenListData}
        refetch={refetch}
        slot={4}
      />
      <Form
        activeExpAmount={data.expeditionList.length}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Select
          name="heldenToExpedition"
          id="expedition"
          ref={register({ required: true })}
          activeExpAmount={data.expeditionList.length}
        >
          <option value={"off"}>Select Free Helden</option>
          {heldenListData
            .filter(helden=>helden.partySlot=== null)
            .filter((helden) => {
              const idsOnExpeditionList = data.expeditionList.map(
                (heldenOnExp) => heldenOnExp.heldenId,
              );
              return !idsOnExpeditionList.includes(helden.id);
            })
            .map((helden) => (
              <option value={helden.id}>{helden.name}</option>
            ))}
        </Select>
        {errors.heldenToExpedition && (
          <div>{JSON.stringify(errors.heldenToExpedition)}</div>
        )}
        <SubmitButton
          type="submit"
          activeExpAmount={data.expeditionList.length}
        >
          Send to Expedition
        </SubmitButton>
      </Form>
    </CardWrapper>
  );
};

export default Store;

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
    query: expeditionListQuery,
  });
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
