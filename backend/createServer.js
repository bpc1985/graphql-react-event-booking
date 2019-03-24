const { GraphQLServer } = require('graphql-yoga');
const Mutation = require('./resolvers/Mutation');
const Query = require('./resolvers/Query');

// Create the GraphQL Yoga Server
function createServer() {
  return new GraphQLServer({
    typeDefs: 'schema.graphql',
    resolvers: {
      Mutation,
      Query
    },
    context: req => ({ ...req })
  });
}

module.exports = createServer;