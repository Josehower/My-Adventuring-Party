import GlobalNav from '../components/GlobalNav';
import GlobalStyle from '../styles/globalStyles';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <GlobalStyle />
      <GlobalNav>
        <Component {...pageProps} />
      </GlobalNav>
    </>
  );
}

export default MyApp;
