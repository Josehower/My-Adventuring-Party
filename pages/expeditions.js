import { gql, useQuery } from '@apollo/client';
import React from 'react';
import { initializeApollo } from '../apollo/client';
import PlayerBag from '../components/PlayerBag';
import { isSessionTokenValid } from '../utils/auth';
import nextCookies from 'next-cookies';

const store = (props) => {
  return <div>EXPEDITIONS</div>;
};

export default store;

export async function getServerSideProps(context) {
  const apolloClient = initializeApollo();

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

  return {
    props: {
      loggedIn,
      initialApolloState: apolloClient.cache.extract(),
    },
  };
}
