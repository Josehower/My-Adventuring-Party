import { gql, useMutation } from '@apollo/client';
import nextCookies from 'next-cookies';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { isSessionTokenValid } from '../utils/auth';

const RegisterLink = styled.a`
  color: white;
  text-decoration: none;
  margin: 10px;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const Form = styled.form`
  margin: 20px auto;
  display: grid;
  justify-items: center;
`;

const loginPlayerMutation = gql`
  mutation loginPlayer($playerName: String!, $password: String!) {
    loginPlayer(input: { playerName: $playerName, password: $password }) {
      playerName
      nickName
    }
  }
`;

const Error = styled.div`
  color: red;
  margin: 0;
  display: inline;
`;

const login = (props) => {
  const [login] = useMutation(loginPlayerMutation);

  const router = useRouter();
  const { register, handleSubmit, errors } = useForm();
  const [errorMessage, setErrorMessage] = useState('');

  async function onSubmit({ playerName, password }) {
    try {
      await login({
        variables: {
          playerName: playerName,
          password: password,
        },
      });

      router.push(props.redirectDestination);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      playerName
      <br />
      <input
        name="playerName"
        ref={register({ required: true })}
        type="text"
      />
      {errors.palyerName && <Error>---{'>'} ups, this is required</Error>}
      <br />
      password
      <br />
      <input
        name="password"
        ref={register({ required: true })}
        type="password"
      />
      {errors.password && <Error>---{'>'} ups, this is required</Error>}
      <br />
      {errorMessage && (
        <Error>
          {errorMessage}
          <br />
        </Error>
      )}
      <button>LogIn</button>
      <Link href="/register">
        <RegisterLink>register</RegisterLink>
      </Link>
    </Form>
  );
};

export default login;

export async function getServerSideProps(context) {
  const { session: token } = nextCookies(context);

  const redirectDestination = context?.query?.returnTo ?? '/';

  if (await isSessionTokenValid(token)) {
    return {
      redirect: {
        destination: redirectDestination,
        permanent: false,
      },
    };
  }
  return {
    props: { loggedIn: false, redirectDestination: redirectDestination },
  };
}
