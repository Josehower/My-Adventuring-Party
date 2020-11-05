import { gql } from 'apollo-server-micro';

const typeDefs = gql`
  type Query {
    playerMoney(id: Int!): PlayerMoney
    playerStore(id: Int!): [StoreItem]
  }
  type StoreItem {
    name: String
    price: Int
    isLocked: Boolean
  }
  type PlayerMoney {
    nickName: String
    gold: Int
    soulStones: Int
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
    hitTheBarrel(id: Int!): Message
    buyItem(itemId: Int!, gameId: Int!, withSoulStones: Boolean): Message
  }
`;

export default typeDefs;
