import crypto from 'crypto';
import argon2 from 'argon2';
import cookie from 'cookie';
import {
  deleteExpiredSessions,
  getPlayerByName,
  insertSession,
} from '../utils/account-database';

export async function login({ playerName, password }) {
  const player = await getPlayerByName(playerName);

  if (typeof player === 'undefined') {
    throw new Error('Player not exist');
  }

  const passwordVerified = await argon2.verify(player.pwHash, password);
  if (!passwordVerified) {
    throw new Error('Password is incorrect');
  }

  // The session token represents the correct authentication
  // of the user (the user entered the correct username
  // and password combination)
  const token = crypto.randomBytes(24).toString('base64');

  await insertSession(token, player.playerId);

  const maxAge = 60 * 60 * 24; // 24 hours

  const isProduction = process.env.NODE_ENV === 'production';

  const sessionCookie = cookie.serialize('session', token, {
    // maxAge: maxAge,
    maxAge,

    expires: new Date(Date.now() + maxAge * 1000),

    // Important for security
    // Deny cookie access from frontend JavaScript
    httpOnly: true,

    // Important for security
    // Set secure cookies on production
    secure: isProduction,

    path: '/',

    // https://web.dev/samesite-cookies-explained/
    sameSite: 'lax',
  });

  await deleteExpiredSessions();

  return [sessionCookie, player];
}
