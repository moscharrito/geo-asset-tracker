import { ApolloClient, InMemoryCache, split, HttpLink } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

const httpUrl = import.meta.env.VITE_GRAPHQL_HTTP_URL || 'http://localhost:5000/graphql';
const wsUrl = import.meta.env.VITE_GRAPHQL_WS_URL || 'ws://localhost:5000/graphql';

// HTTP link for queries and mutations
const httpLink = new HttpLink({
  uri: httpUrl,
});

// WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: wsUrl,
    connectionParams: {
      // Add any auth tokens here if needed
    },
    retryAttempts: 5,
    shouldRetry: () => true,
  })
);

// Split link to route operations to the correct transport
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

// Create Apollo Client instance
export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          assets: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
      Asset: {
        keyFields: ['id'],
      },
      GeoFence: {
        keyFields: ['id'],
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
