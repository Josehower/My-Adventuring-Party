import { getGameByToken, getSessionByToken } from './account-database';
import nextCookies from 'next-cookies';

export async function isSessionTokenValid(token) {
  if (typeof token === 'undefined') {
    return false;
  }

  const session = await getSessionByToken(token);
  //if it dont exists
  if (typeof session === 'undefined') {
    return false;
  }
  //if it is too old
  if (session.expiryTimestamp < new Date()) {
    return false;
  }

  return true;
}

export async function isThisCallAllowed(context) {
  const { session: token } = nextCookies(context);
  const isValid = await isSessionTokenValid(token);
  if (!isValid) return false;
  return true;
}

export async function getGameIdFromContext(ctx) {
  const { session: token } = nextCookies(ctx);
  const { gameId } = await getGameByToken(token);
  return gameId;
}
