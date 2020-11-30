import { login } from '../lib/login';
import { createNewPlayer } from '../lib/player';
import { isThisCallAllowed, getGameIdFromContext } from '../utils/auth';
import {
  deleteCombatInstance,
  initializeCombat,
  updateCombat,
  isCombatInstanceOn,
} from '../utils/Combat-database';
import {
  createExpeditionByHeldenId,
  getGameExpeditionList,
  getHeldenExpeditionTimeLeft,
} from '../utils/expedition-database';
import {
  getPlayerMoneyById,
  getStoreByGameId,
  hitTheBarrelByGameId,
  buyItemByGameId,
  getPlayerBagByGameId,
} from '../utils/game-database';
import {
  createHelden,
  deleteHeldenById,
  getHeldenListByGameId,
  heldenToParty,
  heldenToBench,
  upgradeHeldenVeById,
  upgradeHeldenApById,
  upgradeHeldenPdById,
  upgradeHeldenSdById,
} from '../utils/helden-database';

const resolvers = {
  Query: {
    async isCombatActive(p, args, context) {
      const gameId = await getGameIdFromContext(context);
      const isAllowed = await isThisCallAllowed(context);
      if (isAllowed) {
        return (await isCombatInstanceOn(gameId)) ? true : false;
      }
      return;
    },

    async expeditionTimeLeft(p, args, context) {
      const isAllowed = await isThisCallAllowed(context);
      if (isAllowed) {
        const timeLeft = await getHeldenExpeditionTimeLeft(args.heldenId);
        // console.log(expeditionList);
        return timeLeft;
      }
      return;
    },
    async expeditionList(p, args, context) {
      const gameId = await getGameIdFromContext(context);
      const isAllowed = await isThisCallAllowed(context);
      if (isAllowed) {
        const expeditionList = await getGameExpeditionList(gameId);
        return expeditionList;
      }
      return;
    },

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
    async updateCombat(p, args, context) {
      const isAllowed = await isThisCallAllowed(context);
      const gameId = await getGameIdFromContext(context);

      if (isAllowed) {
        const combat = await updateCombat(args.script, gameId);
        return combat;
      }
      return { message: 'ups... this is not allowed!' };
    },

    async initCombat(p, args, context) {
      const isAllowed = await isThisCallAllowed(context);
      const gameId = await getGameIdFromContext(context);

      if (isAllowed) {
        const combat = await initializeCombat(gameId);
        console.log(combat);
        return combat;
      }
      return { message: 'ups... this is not allowed!' };
    },
    async deleteCombat(p, args, context) {
      const isAllowed = await isThisCallAllowed(context);
      const gameId = await getGameIdFromContext(context);

      if (isAllowed) {
        const message = await deleteCombatInstance(gameId);
        return message;
      }
      return { message: 'ups... this is not allowed!' };
    },

    async createExpedition(p, args, context) {
      const isAllowed = await isThisCallAllowed(context);
      if (isAllowed) {
        const message = await createExpeditionByHeldenId(args.heldenId);
        return message;
      }
      return { message: 'ups... this is not allowed!' };
    },

    async itemVeUpgrade(p, args, context) {
      const isAllowed = await isThisCallAllowed(context);
      if (isAllowed) {
        const message = await upgradeHeldenVeById(args.heldenId, args.amount);
        return message;
      }
      return { message: 'ups... this is not allowed!' };
    },
    async itemApUpgrade(p, args, context) {
      const isAllowed = await isThisCallAllowed(context);
      if (isAllowed) {
        const message = await upgradeHeldenApById(args.heldenId, args.amount);
        return message;
      }
      return { message: 'ups... this is not allowed!' };
    },
    async itemPdUpgrade(p, args, context) {
      const isAllowed = await isThisCallAllowed(context);
      if (isAllowed) {
        const message = await upgradeHeldenPdById(args.heldenId, args.amount);
        return message;
      }
      return { message: 'ups... this is not allowed!' };
    },
    async itemSdUpgrade(p, args, context) {
      const isAllowed = await isThisCallAllowed(context);
      if (isAllowed) {
        const message = await upgradeHeldenSdById(args.heldenId, args.amount);
        return message;
      }
      return { message: 'ups... this is not allowed!' };
    },

    async heldenToBench(p, args) {
      const message = await heldenToBench(args.heldenId);
      return message;
    },

    async heldenToParty(p, args) {
      const message = await heldenToParty(args.heldenId, args.position);
      return message;
    },

    async deleteHelden(p, args, context) {
      const isAllowed = await isThisCallAllowed(context);
      if (isAllowed) {
        const message = deleteHeldenById(args.heldenId);
        return message;
      }
      return { message: 'ups... this is not allowed!' };
    },

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
