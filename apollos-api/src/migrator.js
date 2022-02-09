import dotenv from "dotenv/config"; // eslint-disable-line
import '@apollosproject/data-connector-postgres/lib/postgres/pgEnum-fix';
import config from "./config"; // eslint-disable-line

import ApollosConfig from '@apollosproject/config';
import { createMigrationRunner } from '@apollosproject/data-connector-postgres';

let dataObj;

if (ApollosConfig?.DATABASE?.URL) {
  // this is to pretend we are using content from the DB
  // so we can grab all available migrations
  const tempDBContent = process.env.DATABASE_CONTENT;
  process.env.DATABASE_CONTENT = true;
  dataObj = require('./data/index.postgres');
  process.env.DATABASE_CONTENT = tempDBContent;
} else {
  dataObj = require('./data/index');
}

const { migrations } = dataObj;

// make sure this is called last.
// (or at least after the apollos server setup)
(async () => {
  if (ApollosConfig?.DATABASE?.URL) {
    try {
      const migrationRunner = await createMigrationRunner({ migrations });
      migrationRunner.runAsCLI();
    } catch (e) {
      console.log(e);
    }
  } else {
    console.warn('Please specify a database URL to perform migrations');
  }
})();
