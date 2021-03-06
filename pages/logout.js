import nextCookies from 'next-cookies';
import cookie from 'cookie';
import { deleteSessionByToken } from '../utils/account-database';

export default function Logout() {
  return null;
}

export async function getServerSideProps(context) {
  const { session: token } = nextCookies(context);

  await deleteSessionByToken(token);

  // Remove the cookie
  context.res.setHeader(
    'Set-Cookie',
    cookie.serialize('session', '', {
      maxAge: -1,
      path: '/',
    }),
  );

  return {
    redirect: {
      destination: '/',
      permanent: false,
    },
  };
}
