const { GraphQLServer, PubSub } = require('graphql-yoga');
const Mutation = require('./resolvers/Mutation');
const Query = require('./resolvers/Query');
const Subscription = require('./resolvers/Subscription');

const pubsub = new PubSub();

// Create the GraphQL Yoga Server
function createServer() {
  return new GraphQLServer({
    typeDefs: 'schema.graphql',
    resolvers: {
      Mutation,
      Query,
      Subscription
    },
    context: req => ({ ...req, pubsub })
  });
}

module.exports = createServer;