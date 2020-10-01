import { gql } from 'apollo-server';

import {
  createApolloServerConfig,
  Interfaces,
} from '@apollosproject/server-core';

import * as Analytics from '@apollosproject/data-connector-analytics';
import * as Scripture from '@apollosproject/data-connector-bible';

import * as Cloudinary from '@apollosproject/data-connector-cloudinary';
import * as OneSignal from '@apollosproject/data-connector-onesignal';
// import * as Search from '@apollosproject/data-connector-algolia-search';
import * as Pass from '@apollosproject/data-connector-passes';
import * as Cache from '@apollosproject/data-connector-redis-cache';
import * as Sms from '@apollosproject/data-connector-twilio';
import {
  Followings,
  Interactions,
  RockConstants,
  Sharable,
  PersonalDevice,
  Template,
  AuthSms,
  Group,
  BinaryFiles,
  Event,
  PrayerRequest,
  Campus,
} from '@apollosproject/data-connector-rock';
import * as LiveStream from './ChurchOnline';
import * as Theme from './theme';
import * as GraceGroup from './GraceGroup';
import * as Auth from './Auth';
import * as Feature from './Feature';
import * as ContentItem from './ContentItem';
import * as ContentChannel from './ContentChannel';
import * as Vimeo from './Vimeo';
import * as Person from './Person';
import * as Search from './Algolia';
// This module is used to attach Rock User updating to the OneSignal module.
// This module includes a Resolver that overides a resolver defined in `OneSignal`
import * as OneSignalWithRock from './oneSignalWithRock';

const data = {
  Interfaces,
  Followings,
  ContentChannel,
  ContentItem,
  Person,
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
  BinaryFiles,
  Feature,
  Event,
  Cache,
  GraceGroup,
  Vimeo,
  PrayerRequest,
};

const {
  dataSources,
  resolvers,
  schema,
  context,
  applyServerMiddleware,
  setupJobs,
} = createApolloServerConfig(data);

export {
  dataSources,
  resolvers,
  schema,
  context,
  applyServerMiddleware,
  setupJobs,
};

// the upload Scalar is added
export const testSchema = [
  gql`
    scalar Upload
  `,
  ...schema,
];
