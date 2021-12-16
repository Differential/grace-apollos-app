import { gql } from 'apollo-server';

import {
  createApolloServerConfig,
  Interfaces,
} from '@apollosproject/server-core';

import * as Analytics from '@apollosproject/data-connector-analytics';
import * as Scripture from '@apollosproject/data-connector-bible';
import * as LiveStream from '@apollosproject/data-connector-church-online';
import * as Cloudinary from '@apollosproject/data-connector-cloudinary';
import * as OneSignal from '@apollosproject/data-connector-onesignal';
import * as Search from '@apollosproject/data-connector-algolia-search';
import * as Pass from '@apollosproject/data-connector-passes';
import * as Cache from '@apollosproject/data-connector-redis-cache';
import * as Sms from '@apollosproject/data-connector-twilio';
import {
  Followings,
  Interactions,
  // RockConstants,
  // ContentItem,
  // ContentChannel,
  Sharable,
  Auth,
  PersonalDevice,
  Template,
  AuthSms,
  Campus,
  Group,
  // Feature,
  FeatureFeed,
  ActionAlgorithm,
  Event,
  PrayerRequest,
  Persona,
  // Person,
  BinaryFiles,
} from '@apollosproject/data-connector-rock';

import * as Theme from './theme';
import * as GraceGroup from './GraceGroup';
import * as Feature from './Feature';
import * as ContentItem from './ContentItem';
import * as ContentChannel from './ContentChannel';
import * as Vimeo from './Vimeo';
import * as Person from './Person';
import * as RockConstants from './RockConstants';

// This module is used to attach Rock User updating to the OneSignal module.
// This module includes a Resolver that overides a resolver defined in `OneSignal`
import * as OneSignalWithRock from './oneSignalWithRock';

// This is to mock any postgres resolvers so we don't throw API errors for unresolved
// typedefs
import NoPostgres from './noPostgres';

const data = {
  Interfaces,
  Followings,
  ContentChannel,
  ContentItem,
  Cloudinary,
  Auth,
  AuthSms,
  Sms,
  LiveStream,
  Theme,
  Scripture,
  Interactions,
  RockConstants,
  Sharable,
  Analytics,
  OneSignal,
  PersonalDevice,
  OneSignalWithRock,
  Pass,
  Search,
  Template,
  Campus,
  Group,
  Feature,
  FeatureFeed,
  ActionAlgorithm,
  Event,
  Cache,
  Vimeo,
  GraceGroup,
  PrayerRequest,
  Persona,
  Person,
  BinaryFiles,
  NoPostgres,
};

const {
  dataSources,
  resolvers,
  schema,
  context,
  applyServerMiddleware,
  setupJobs,
  migrations,
} = createApolloServerConfig(data);

export {
  dataSources,
  resolvers,
  schema,
  context,
  applyServerMiddleware,
  setupJobs,
  migrations,
};

// the upload Scalar is added
export const testSchema = [
  gql`
    scalar Upload
  `,
  ...schema,
];
