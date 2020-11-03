import argon2 from 'argon2';
import Tokens from 'csrf';
import { registerPlayer, getPlayerByName } from '../../utils/account-database';
import { createGameInstance } from '../../utils/game-database';

const tokens = new Tokens();

export default async (req, res) => {
  const { playerName, email, password, nickname, token } = req.body;

  const secret = process.env.CSRF_TOKEN_SECRET;

  if (typeof secret === 'undefined') {
    response.status(500).send({ success: false });
    throw new Error('CSRF_TOKEN_SECRET environment variable not configured!');
  }

  const verified = tokens.verify(secret, token);

  if (!verified) {
    // HTTP status code: 401 Unauthorized
    return res.status(401).send({ success: false });
  }

  const usernameAlreadyTaken =
    typeof (await getPlayerByName(playerName)) !== 'undefined';

  if (usernameAlreadyTaken) {
    // HTTP status code: 409 Conflict
    return res.status(409).send({ success: false });
  }

  try {
    const pwHash = await argon2.hash(password);
    const gameInstance = await createGameInstance();
    await registerPlayer({ playerName, email, nickname, pwHash, gameInstance });
  } catch (err) {
    // If hashing the password or registering the user fails
    // for any reason, then return an error status
    // HTTP status code: 500 Internal Server Error
    return res.status(500).send({ success: false });
  }

  res.status(200).send({ success: true });
};
