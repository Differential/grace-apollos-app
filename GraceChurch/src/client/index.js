import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as ApolloHookProvider } from '@apollo/react-hooks';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { getVersion, getApplicationName } from 'react-native-device-info';

import { authLink, buildErrorLink } from '@apollosproject/ui-auth';

import { NavigationService } from '@apollosproject/ui-kit';
import { resolvers, schema, defaults } from '../store';

import bugsnag from '../bugsnag';
import httpLink from './httpLink';
import cache, { ensureCacheHydration } from './cache';
import MARK_CACHE_LOADED from './markCacheLoaded';

const goToAuth = () => NavigationService.resetToAuth();
const wipeData = () => cache.writeData({ data: defaults });

let clearStore;
let storeIsResetting = false;
const onAuthError = async () => {
  bugsnag.notify(new Error('Client Auth Error'));
  if (!storeIsResetting) {
    storeIsResetting = true;
    await clearStore();
  }
  storeIsResetting = false;
  goToAuth();
};

const errorLink = buildErrorLink(onAuthError);

const link = ApolloLink.from([authLink, errorLink, httpLink]);

export const client = new ApolloClient({
  link,
  cache,
  queryDeduplication: false,
  shouldBatch: true,
  resolvers,
  typeDefs: schema,
  name: getApplicationName(),
  version: getVersion(),
});

// Hack to give auth link access to method on client;
// eslint-disable-next-line prefer-destructuring
// clearStore = client.clearStore;

wipeData();
// Ensure that media player still works after logout.
client.onClearStore(() => wipeData());

class ClientProvider extends PureComponent {
  static propTypes = {
    client: PropTypes.shape({
      cache: PropTypes.shape({}),
    }),
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
      PropTypes.object, // covers Fragments
    ]).isRequired,
  };

  static defaultProps = {
    client,
  };

  async componentDidMount() {
    try {
      await ensureCacheHydration;
    } catch (e) {
      throw e;
    } finally {
      client.mutate({ mutation: MARK_CACHE_LOADED });
    }
  }

  render() {
    const { children, ...otherProps } = this.props;
    return (
      <ApolloProvider {...otherProps} client={client}>
        <ApolloHookProvider {...otherProps} client={client}>
          {children}
        </ApolloHookProvider>
      </ApolloProvider>
    );
  }
}

export default ClientProvider;
