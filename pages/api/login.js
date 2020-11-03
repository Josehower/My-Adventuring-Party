import crypto from 'crypto';
import argon2 from 'argon2';
import cookie from 'cookie';
import {
  deleteExpiredSessions,
  getPlayerByName,
  insertSession,
} from '../../utils/account-database';

export default async function handler(req, res) {
  const { playerName, password } = req.body;
  const player = await getPlayerByName(playerName);

  if (typeof player === 'undefined') {
    return res.status(401).send({ success: false });
  }

  const passwordVerified = await argon2.verify(player.pwHash, password);
  if (!passwordVerified) {
    return res.status(401).send({ success: false });
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

  res.setHeader('Set-Cookie', sessionCookie);

  res.send({ success: true });

  await deleteExpiredSessions();
}
