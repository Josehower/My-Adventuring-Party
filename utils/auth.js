import { getSessionByToken } from './account-database';

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
