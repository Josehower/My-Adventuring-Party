import argon2 from 'argon2';
import Tokens from 'csrf';
import { registerPlayer, getPlayerByName } from '../utils/account-database';
import { createGameInstance } from '../utils/game-database';
const tokens = new Tokens();

export async function createNewPlayer({
  playerName,
  email,
  password,
  nickname,
  token,
}) {
  const secret = process.env.CSRF_TOKEN_SECRET;

  if (typeof secret === 'undefined') {
    throw new Error('CSRF_TOKEN_SECRET environment variable not configured!');
  }

  const verified = tokens.verify(secret, token);

  if (!verified) {
    throw new Error('Unauthorized');
  }

  const usernameAlreadyTaken =
    typeof (await getPlayerByName(playerName)) !== 'undefined';

  if (usernameAlreadyTaken) {
    // HTTP status code: 409 Conflict
    throw new Error('this player name already exist');
  }

  try {
    const pwHash = await argon2.hash(password);
    const gameInstance = await createGameInstance();
    const player = await registerPlayer({
      playerName,
      email,
      nickname,
      pwHash,
      gameInstance,
    });
    return player;
  } catch (err) {
    // If hashing the password or registering the user fails
    // for any reason, then return an error status
    // HTTP status code: 500 Internal Server Error
    throw new Error('server internal error');
  }
}
