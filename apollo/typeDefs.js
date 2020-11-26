import { gql } from 'apollo-server-micro';

const typeDefs = gql`
  type Query {
    playerMoney: PlayerMoney
    playerStore: [StoreItem]
    playerBag: [BagItem]
    heldenList: [Helden]
    expeditionList: [Expedition]
    expeditionTimeLeft(heldenId: Int!): String
  }

  type Mutation {
    createPlayer(input: PlayerInput!): Player!
    loginPlayer(input: LoginInput!): Player!
    hitTheBarrel: Message
    buyItem(itemId: Int!, withSoulStones: Boolean): Message
    createHelden(name: String!, className: String!): Message
    deleteHelden(heldenId: Int!): Message
    heldenToParty(heldenId: Int!, position: Int!): Message
    heldenToBench(heldenId: Int!): Message
    itemVeUpgrade(heldenId: Int!, amount: Int): Message
    itemApUpgrade(heldenId: Int!, amount: Int): Message
    itemPdUpgrade(heldenId: Int!, amount: Int): Message
    itemSdUpgrade(heldenId: Int!, amount: Int): Message
    createExpedition(heldenId: Int!): Message
    updateCombat(script: TurnScript): CombatState
    initCombat: CombatState
    deleteCombat: Message
  }

  input TurnScript {
    enemyTeam: [CreaturePerformedAction]
    playerTeam: [HeldenPerformedAction]
  }

  input CreaturePerformedAction {
    actionId: Int
    creatureInstanceId: Int
    target: Int
  }
  input HeldenPerformedAction {
    actionId: Int
    heldenInstanceId: Int
    target: Int
  }

  type CombatState {
    combatInstance: CombatInstance
    playerTeam: [HeldenInstance]
    enemyTeam: [CreatureInstance]
  }

  type CombatInstance {
    combatId: Int
    actualTurn: Int
    gameId: Int
  }

  type CreatureInstance {
    creatureInstanceId: Int
    creatureId: Int
    combatId: Int
    saAvaliable: Int
    instanceVe: Int
    slotPosition: Int
    name: String
    ap: Int
    sd: Int
    pd: Int
    type: CreatureType
    actions: [Action]
  }

  type HeldenInstance {
    heldenInstanceId: Int
    heldenId: Int
    combatId: Int
    saAvaliable: Int
    instanceVe: Int
    ap: Int
    sd: Int
    pd: Int
    name: String
    class: ClassType
    slotPosition: Int
    actions: [Action]
  }

  type ClassType {
    classId: Int
    className: String
    classImg: String
  }

  type CreatureType {
    typeId: Int
    typeImage: String
    typeName: String
  }

  type Action {
    creatureId: Int
    heldenId: Int
    actionId: Int
    name: String
    desc: String
    target: String
    speed: String
  }

  type Expedition {
    gameId: Int
    heldenId: Int
    name: String
    lvlLevel: Int
    expeditionStartDate: String
  }

  type Helden {
    id: Int
    gameId: Int
    name: String
    lvl: Int
    exs: Int
    sa: Int
    partySlot: Int
    class: HeldenClass
    stats: HeldenStats
  }

  type HeldenClass {
    className: String
    classId: Int
    classImg: String
  }

  type HeldenStats {
    ve: Int
    ap: Int
    sd: Int
    pd: Int
  }
  type StoreItem {
    name: String
    price: Int
    isLocked: Boolean
    description: String
    gameId: Int
    itemId: Int
  }
  type BagItem {
    itemId: Int
    name: String
    qty: Int
    description: String
  }
  type PlayerMoney {
    nickName: String
    gold: Int
    soulStones: Int
    lastHit: String
  }
  type Player {
    playerId: Int
    playerName: String
    eMail: String
    nickName: String
    gameId: Int
  }
  input PlayerInput {
    playerName: String!
    email: String!
    password: String!
    nickname: String!
    token: String!
  }
  input LoginInput {
    playerName: String!
    password: String!
  }
  type Message {
    message: String
  }
`;

export default typeDefs;
