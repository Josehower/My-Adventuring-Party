import GlobalStyle, { colors } from '../styles/globalStyles';
import GlobalNav from '../components/GlobalNav';
import { ApolloProvider } from '@apollo/client';
import { useApollo } from '../apollo/client';
import { useState } from 'react';
import styled from 'styled-components';
import GameNav from '../components/GameNav';
import Head from 'next/head';

const Prompt = styled.div`
  background: rgb(48, 39, 223);
  background: linear-gradient(
    180deg,
    rgba(48, 39, 223, 1) 0%,
    rgba(4, 0, 94, 1) 75%
  );
  color: ${colors.white};
  height: 3em;
  margin: 2px;
  padding: 0.5em;
  border-radius: 5px;
  border: 2px solid ${colors.white};
  font-family: 'VT323', monospace;
  font-size: 30px;

  ${(props) => (props.loggedIn ? '' : 'display: none;')}
`;

const BodyMargin = styled.div`
  margin: 0 auto;
  width: 95vw;
`;

function MyApp({ Component, pageProps }) {
  const apolloClient = useApollo(pageProps.initialApolloState);

  const [prompt, setPrompt] = useState('Welcome to my adventuring party');

  return (
    <>
      <Head>
        <title>Prototype</title>
        <link rel="icon" href="/favicon.ico" />
        <link
          href="https://fonts.googleapis.com/css2?family=VT323&display=swap"
          rel="stylesheet"
        ></link>
        <link
          href="https://fonts.googleapis.com/css2?family=Aclonica&display=swap"
          rel="stylesheet"
        ></link>
      </Head>

      <GlobalStyle />
      <ApolloProvider client={apolloClient}>
        <GlobalNav loggedIn={pageProps.loggedIn} setPrompt={setPrompt}>
          <BodyMargin>
            <Prompt loggedIn={pageProps.loggedIn}>{prompt}</Prompt>
            <GameNav loggedIn={pageProps.loggedIn} />
            <Component {...pageProps} setPrompt={setPrompt} />
          </BodyMargin>
        </GlobalNav>
      </ApolloProvider>
    </>
  );
}

export default MyApp;
