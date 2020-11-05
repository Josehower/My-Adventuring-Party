import GlobalStyle from '../styles/globalStyles';
import GlobalNav from '../components/GlobalNav';
import { ApolloProvider } from '@apollo/client';
import { useApollo } from '../apollo/client';

function MyApp({ Component, pageProps }) {
  const apolloClient = useApollo(pageProps.initialApolloState);

  return (
    <>
      <GlobalStyle />
      <ApolloProvider client={apolloClient}>
        <GlobalNav>
          <Component {...pageProps} />
        </GlobalNav>
      </ApolloProvider>
    </>
  );
}

export default MyApp;
