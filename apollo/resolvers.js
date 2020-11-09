import { login } from '../lib/login';
import { createNewPlayer } from '../lib/player';
import nextCookies from 'next-cookies';
import { isSessionTokenValid } from '../utils/auth';
import { getGameByToken } from '../utils/account-database';

async function isThisCallAllowed(context) {
  if (process.env.NODE_ENV !== 'development') {
    const { session: token } = nextCookies(context);
    const isValid = await isSessionTokenValid(token);
    if (!isValid) return false;
  }
  return true;
}
const {
  getPlayerMoneyById,
  getStoreByGameId,
  hitTheBarrelByGameId,
  buyItemByGameId,
  getPlayerBagByGameId,
} = require('../utils/game-database');

const resolvers = {
  Query: {
    async playerMoney(p, args, _context) {
      const { session: token } = nextCookies(_context);
      const loggedIn = await isSessionTokenValid(token);
      const gameInstance = await getGameByToken(token);
      const gameId = gameInstance.gameId;
      if (!loggedIn) {
        return;
      }
      const playerMoneyObj = await getPlayerMoneyById(gameId);
      const lastHitJson = playerMoneyObj.lastHit;
      return { ...playerMoneyObj, lastHitJson };
    },
    async playerStore(p, args) {
      return getStoreByGameId(args.id);
    },
    async playerBag(p, args, context, info) {
      if (!context) {
        console.log('i am there', context);
        return getPlayerBagByGameId(args.gameId);
      }
      const { session: token } = nextCookies(context);
      const loggedIn = await isSessionTokenValid(token);
      const gameInstance = await getGameByToken(token);
      const gameId = gameInstance.gameId;
      if (!loggedIn) {
        return;
      }
      console.log('i am here', context);
      return getPlayerBagByGameId(gameId);
    },
  },
  Mutation: {
    async createPlayer(_parent, args, _context, _info) {
      const user = await createNewPlayer(args.input);
      return user;
    },
    async loginPlayer(_parent, args, _context, _info) {
      const [sessionCookie, player] = await login(args.input);
      _context.res.setHeader('Set-cookie', sessionCookie);
      return player;
    },
    async hitTheBarrel(p, args, context) {
      const { session: token } = nextCookies(context);
      const gameInstance = await getGameByToken(token);
      const gameId = gameInstance.gameId;
      const isAllowed = await isThisCallAllowed(context);
      if (isAllowed) {
        const message = await hitTheBarrelByGameId(gameId);
        return message;
      }
      return { message: 'ups... this is not allowed!' };
    },
    async buyItem(p, args, context) {
      const isAllowed = await isThisCallAllowed(context);
      if (isAllowed) {
        const message = await buyItemByGameId(
          args.itemId,
          args.gameId,
          args.withSoulStones,
        );
        return message;
      }
      return { message: 'ups... this is not allowed!' };
    },
  },
};

export default resolvers;
