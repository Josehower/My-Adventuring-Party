import { login } from '../lib/login';
import { createNewPlayer } from '../lib/player';
import { isThisCallAllowed, getGameIdFromContext } from '../utils/auth';
import {
  getPlayerMoneyById,
  getStoreByGameId,
  hitTheBarrelByGameId,
  buyItemByGameId,
  getPlayerBagByGameId,
} from '../utils/game-database';
import { createHelden, getHeldenListByGameId } from '../utils/helden-database';

const resolvers = {
  Query: {
    async heldenList(p, args, context) {
      const gameId = await getGameIdFromContext(context);
      const isAllowed = await isThisCallAllowed(context);
      if (isAllowed) {
        const heldenList = await getHeldenListByGameId(gameId);
        return heldenList;
      }
      return;
    },

    async playerMoney(p, args, context) {
      const gameId = await getGameIdFromContext(context);
      const isAllowed = await isThisCallAllowed(context);
      if (isAllowed) {
        const playerMoneyObj = await getPlayerMoneyById(gameId);
        return { ...playerMoneyObj };
      }
      return;
    },

    async playerStore(p, args, context) {
      const gameId = await getGameIdFromContext(context);
      const isAllowed = await isThisCallAllowed(context);
      if (isAllowed) {
        return getStoreByGameId(gameId);
      }
      return;
    },

    async playerBag(p, args, context) {
      const gameId = await getGameIdFromContext(context);
      const isAllowed = await isThisCallAllowed(context);
      if (isAllowed) {
        return getPlayerBagByGameId(gameId);
      }
      return;
    },
  },

  Mutation: {
    async createHelden(p, args, context) {
      const gameId = await getGameIdFromContext(context);
      const isAllowed = await isThisCallAllowed(context);
      if (isAllowed) {
        const message = createHelden(args.className, args.name, gameId);
        return message;
      }
      return { message: 'ups... this is not allowed!' };
    },

    async createPlayer(p, args) {
      const user = await createNewPlayer(args.input);
      return user;
    },
    async loginPlayer(p, args, context) {
      const [sessionCookie, player] = await login(args.input);
      context.res.setHeader('Set-cookie', sessionCookie);
      return player;
    },
    async hitTheBarrel(p, args, context) {
      const gameId = await getGameIdFromContext(context);
      const isAllowed = await isThisCallAllowed(context);
      if (isAllowed) {
        const message = await hitTheBarrelByGameId(gameId);
        return message;
      }
      return { message: 'ups... this is not allowed!' };
    },

    async buyItem(p, args, context) {
      const isAllowed = await isThisCallAllowed(context);
      const gameId = await getGameIdFromContext(context);
      if (isAllowed) {
        const message = await buyItemByGameId(
          args.itemId,
          gameId,
          args.withSoulStones,
        );
        return message;
      }
      return { message: 'ups... this is not allowed!' };
    },
  },
};

export default resolvers;
