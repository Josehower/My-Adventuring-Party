import { gql } from 'apollo-server-micro';

const typeDefs = gql`
  type Query {
    playerMoney: PlayerMoney
    playerStore: [StoreItem]
    playerBag: [bagItem]
    heldenList: [Helden]
  }
  type Mutation {
    createPlayer(input: PlayerInput!): Player!
    loginPlayer(input: LoginInput!): Player!
    hitTheBarrel: Message
    buyItem(itemId: Int!, withSoulStones: Boolean): Message
    createHelden(name: String!, className: String!): Message
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
  type bagItem {
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
