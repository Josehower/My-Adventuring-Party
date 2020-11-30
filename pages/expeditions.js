import { gql, useMutation, useQuery } from '@apollo/client';
import React from 'react';
import { initializeApollo } from '../apollo/client';
import { isSessionTokenValid } from '../utils/auth';
import nextCookies from 'next-cookies';
import { heldenListQuery } from './helden';
import { useForm } from 'react-hook-form';
import HeldenExpeditionCard from '../components/heldenExpeditionCard';
import styled from 'styled-components';

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

const store = (props) => {
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
      <form
        activeExpAmount={data.expeditionList.length}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Select
          name="heldenToExpedition"
          id="expedition"
          ref={register({ required: true })}
          activeExpAmount={data.expeditionList.length}
        >
          {heldenListData
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
      </form>
    </CardWrapper>
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
