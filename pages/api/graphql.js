import { ApolloServer, gql } from 'apollo-server-micro';
import { makeExecutableSchema } from 'graphql-tools';
import typeDefs from '../../apollo/typeDefs';
import resolvers from '../../apollo/resolvers';

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const apolloServer = new ApolloServer({
  schema,
  context(ctx) {
    return { ...ctx, custom: 'heyyyyyyyy' };
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apolloServer.createHandler({ path: '/api/graphql' });
