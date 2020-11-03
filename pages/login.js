import { useForm } from 'react-hook-form';
import nextCookies from 'next-cookies';
import { isSessionTokenValid } from '../utils/auth';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { useState } from 'react';
import Link from 'next/link';

const Error = styled.div`
  color: red;
  margin: 0;
  display: inline;
`;

const login = (props) => {
  const router = useRouter();
  const { register, handleSubmit, errors } = useForm();
  const [errorMessage, setErrorMessage] = useState('');

  async function onSubmit({ playerName, password }) {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerName, password }),
    });

    const { success } = await response.json();

    if (!success) {
      const statusObj = {
        401: 'name or password is wrong',
        500: 'there was a problem with the database',
      };

      const message = statusObj[response.status];

      setErrorMessage(message ? message : 'unknown error on login');
    } else {
      setErrorMessage('');
      router.push(props.redirectDestination);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      palyerName
      <br />
      <input
        value="heggart"
        name="playerName"
        ref={register({ required: true })}
        type="text"
      />
      {errors.palyerName && <Error>---{'>'} ups, this is required</Error>}
      <br />
      password
      <br />
      <input
        value="123abc123"
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
        <a>register</a>
      </Link>
    </form>
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
