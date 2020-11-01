import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useState } from 'react';

const Error = styled.div`
  color: red;
  margin: 0;
  display: inline;
`;

const register = ({ token }) => {
  const { register, handleSubmit, errors } = useForm();
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  async function onSubmit({ username, email, password, nickname }) {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        email,
        password,
        nickname,
        token,
      }),
    });
    const { success } = await response.json();

    if (success) {
      router.push('/');
    } else {
      console.log(response.status);
      setErrorMessage('fail');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      username
      <br />
      <input
        value="michael"
        name="username"
        ref={register({ required: true })}
        type="text"
      />
      {errors.username && <Error>---{'>'} ups, this is required</Error>}
      <br />
      email
      <br />
      <input
        value="michael-jordan@chicagobulls.com"
        name="email"
        ref={register({ required: true })}
        type="text"
      />
      {errors.email && <Error>---{'>'} ups, this is required</Error>}
      <br />
      nickname
      <br />
      <input
        value="toro"
        name="nickname"
        ref={register({ required: true })}
        type="text"
      />
      {errors.nickname && <Error>---{'>'} ups, this is required</Error>}
      <br />
      password
      <br />
      <input
        value="123456"
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
      <button>register</button>
    </form>
  );
};

export default register;

export async function getServerSideProps() {
  // Import and instantiate a CSRF tokens helper
  const tokens = new (await import('csrf')).default();
  const secret = process.env.CSRF_TOKEN_SECRET;

  if (typeof secret === 'undefined') {
    throw new Error('CSRF_TOKEN_SECRET environment variable not configured!');
  }

  // Create a CSRF token based on the secret
  const token = tokens.create(secret);
  return { props: { token } };
}
