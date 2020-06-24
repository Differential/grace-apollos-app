import { ApolloServer } from 'apollo-server-express';
import ApollosConfig from '@apollosproject/config';
import express from 'express';
import { RockLoggingExtension } from '@apollosproject/rock-apollo-data-source';
import { get, fromPairs } from 'lodash';
import { setupUniversalLinks } from '@apollosproject/server-core';

import {
  resolvers,
  schema,
  testSchema,
  context,
  dataSources,
  applyServerMiddleware,
  setupJobs,
} from './data';
import { report } from './data/bugsnag';

export { resolvers, schema, testSchema };

const isDev =
  process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test';

const extensions = isDev ? [() => new RockLoggingExtension()] : [];

const cacheOptions = isDev
  ? {}
  : {
      cacheControl: {
        stripFormattedExtensions: false,
        calculateHttpHeaders: true,
        defaultMaxAge: 3600,
      },
    };

const { ENGINE } = ApollosConfig;

const plugins = [
  {
    requestDidStart() {
      return {
        didEncounterErrors({ errors, request }) {
          const headers = fromPairs(Array.from(request.http.headers.entries()));
          errors.forEach((error) => {
            isDev && console.log(error);
            report(
              error,
              {
                'GraphQL Info': {
                  query: request.query,
                  location: JSON.stringify(error.locations),
                  variables: request.variables,
                  operationName: request.operationName,
                  headers,
                },
                'Auth Error Info': get(
                  error,
                  'extensions.exception.userContext'
                ),
              },
              (err) => {
                const ip = get(headers, 'fastly-client-ip', 'unknown');
                err.user = {
                  id: ip,
                  appVersion: get(headers, 'user-agent', 'unknown'),
                };
              }
            );
          });
        },
      };
    },
  },
];

const apolloServer = new ApolloServer({
  typeDefs: schema,
  resolvers,
  dataSources,
  context,
  introspection: true,
  extensions,
  plugins,
  debug: true,
  formatError: (error) => {
    if (get(error, 'extensions.exception.stacktrace')) {
      delete error.extensions.exception.stacktrace;
    }
    if (get(error, 'extensions.exception.userContext')) {
      delete error.extensions.exception.userContext;
    }
    return error;
  },
  playground: {
    settings: {
      'editor.cursorShape': 'line',
    },
  },
  ...cacheOptions,
  engine: {
    apiKey: ENGINE.API_KEY,
    schemaTag: ENGINE.SCHEMA_TAG,
  },
});

const app = express();

applyServerMiddleware({ app, dataSources, context });

setupJobs({ app, dataSources, context });

// Comment out if you don't want the API serving apple-app-site-association or assetlinks manifests.
setupUniversalLinks({ app });

apolloServer.applyMiddleware({ app });
apolloServer.applyMiddleware({ app, path: '/' });

export default app;
