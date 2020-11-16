import { gql, useMutation, useQuery } from '@apollo/client';
import React from 'react';
import { initializeApollo } from '../apollo/client';
import { isSessionTokenValid } from '../utils/auth';
import nextCookies from 'next-cookies';
import Timer from '../components/Timer';
import { heldenListQuery } from './helden';
import { useForm } from 'react-hook-form';

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

  async function onSubmit(data) {
    const heldenId = parseInt(data.heldenToExpedition, 10);
    const { data: crateHeldenMessage } = await createExpedition({
      variables: { heldenId: heldenId },
    });

    console.log('hola Amigos', crateHeldenMessage);

    refetch();
  }

  if (loading || heldenLoading) return <p>loading...</p>;
  if (error || heldenError) return `${error}`;

  return (
    <div>
      {/* {<div>{JSON.stringify(data.expeditionList)}</div>} */}
      {data.expeditionList.map((expedition) => (
        <div key={expedition.heldenId}>
          {console.log(expedition.heldenId)}
          Helden name = {expedition.name} lvl = {expedition.lvlLevel}
          <Timer heldenId={expedition.heldenId} refetcher={refetch} />
        </div>
      ))}

      {/* {<div>{JSON.stringify(heldenListData[0])}</div>} */}

      <form onSubmit={handleSubmit(onSubmit)}>
        <select
          name="heldenToExpedition"
          id="expedition"
          ref={register({ required: true })}
        >
          {heldenListData.map((helden) => (
            <option value={helden.id}>{helden.name}</option>
          ))}
        </select>
        {errors.heldenToExpedition && (
          <div>{JSON.stringify(errors.heldenToExpedition)}</div>
        )}
        <button type="submit">Send to Expedition</button>
      </form>
    </div>
  );
};

export default store;

export async function getServerSideProps(context) {
  const apolloClient = initializeApollo(null, context);

  // await createExpeditionByHeldenId(96);
  // await createExpeditionByHeldenId(95);
  // await createExpeditionByHeldenId(94);
  // await createExpeditionByHeldenId(93);
  // await createExpeditionByHeldenId(98);
  // await createExpeditionByHeldenId(95);

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
