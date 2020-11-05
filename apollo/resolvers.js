import { login } from '../lib/login';
import { createNewPlayer } from '../lib/player';
import nextCookies from 'next-cookies';
import { isSessionTokenValid } from '../utils/auth';

async function isThisCallAllowed(context) {
  if (process.env.NODE_ENV !== 'development') {
    const { session: token } = nextCookies(context);
    const isValid = await isSessionTokenValid(token);
    console.log(process.env.NODE_ENV);
    if (!isValid) return false;
  }
  return true;
}

const {
  getPlayerMoneyById,
  getStoreByGameId,
  hitTheBarrelByGameId,
  buyItemByGameId,
} = require('../utils/game-database');

const resolvers = {
  Query: {
    playerMoney(p, args) {
      return getPlayerMoneyById(args.id);
    },
    playerStore(p, args) {
      return getStoreByGameId(args.id);
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
      const isAllowed = await isThisCallAllowed(context);
      if (isAllowed) {
        const message = await hitTheBarrelByGameId(args.id);
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
