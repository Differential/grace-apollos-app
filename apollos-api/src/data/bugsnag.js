import bugsnag from '@bugsnag/js';
import { RESTDataSource } from 'apollo-datasource-rest';

const bugsnagClient = bugsnag({
  apiKey: process.env.BUGSNAG_API_KEY,
  releaseStage: process.env.RELEASE_STAGE || 'development',
});

export const report = (error, metaData, beforeSend) => {
  bugsnagClient.notify(error, {
    metaData: {
      Rock: { rockUrl: 'https://trygrace.org/api' },
      ...metaData,
    },
    beforeSend,
  });
};

const originaldidReceiveResponse = RESTDataSource.prototype.didReceiveResponse;

RESTDataSource.prototype.didReceiveResponse = function(response, _request) {
  if (response.status !== 200) {
    report(new Error(`${response.status} in RESTDataSource`), {
      metaData: {
        Response: {
          status: response.status,
          statusText: response.statusText,
          body: response.body,
        },
        Request: {
          method: _request.method,
          url: _request.url,
          headers: _request.headers,
        },
      },
    });
  }
  return originaldidReceiveResponse.call(this, response, _request);
};
