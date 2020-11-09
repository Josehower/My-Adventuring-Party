import { gql } from 'apollo-server-micro';

const typeDefs = gql`
  type Query {
    playerMoney: PlayerMoney
    playerStore(id: Int!): [StoreItem]
    playerBag(gameId: Int): [bagItem]
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
    lastHitJson: String
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
  type Mutation {
    createPlayer(input: PlayerInput!): Player!
    loginPlayer(input: LoginInput!): Player!
    hitTheBarrel: Message
    buyItem(itemId: Int!, gameId: Int!, withSoulStones: Boolean): Message
  }
`;

export default typeDefs;
