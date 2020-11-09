import React from 'react';
import { initializeApollo } from '../apollo/client';
import { isSessionTokenValid } from '../utils/auth';
import nextCookies from 'next-cookies';

const StoryMode = (props) => {
  return (
    <>
      <div>chapter 1</div>
      <div>chapter 2</div>
      <div>chapter 3</div>
    </>
  );
};

export default StoryMode;

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
