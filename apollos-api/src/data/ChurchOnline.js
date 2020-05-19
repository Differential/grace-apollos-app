/* eslint-disable class-methods-use-this */
import { RESTDataSource } from 'apollo-datasource-rest';
import ApollosConfig from '@apollosproject/config';
import { get } from 'lodash';

export { resolver, schema } from '@apollosproject/data-connector-church-online';

export class dataSource extends RESTDataSource {
  resource = 'LiveStream';

  get baseURL() {
    return ApollosConfig.CHURCH_ONLINE.URL;
  }

  get mediaUrls() {
    return ApollosConfig.CHURCH_ONLINE.MEDIA_URLS;
  }

  get webViewUrl() {
    return ApollosConfig.CHURCH_ONLINE.WEB_VIEW_URL;
  }

  async getLiveStream() {
    const result = await this.post(
      'graphql',
      {
        operationName: 'CurrentState',
        query: `query CurrentState {
  currentService {
    ...ServiceFields
    __typename
  }
}

fragment ServiceFields on Service {
  id
  startTime
  scheduleTime
  endTime
  content {
    id
    features {
      publicChat
      livePrayer
      __typename
    }
    hostInfo
    notes
    title
    hasVideo
    videoStarted
    video {
      type
      url
      source
      __typename
    }
    videoStartTime
    __typename
  }
  sequence {
    serverTime
    steps {
      fetchTime
      queries
      transitionTime
      __typename
    }
    __typename
  }
  feed {
    id
    key
    type
    name
    direct
    group
    subscribers {
      id
      nickname
      avatar
      role {
        label
        __typename
      }
      __typename
    }
    __typename
  }
  __typename
}`,
      },
      {
        headers: {
          cookie:
            '__cfduid=d421f6396a02cbfe04c6e5631d144d52e1589483017; access_token=eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJsaXZlLnRyeWdyYWNlLm9yZyIsImV4cCI6MTU5MDQxODM2Miwib3JnYW5pemF0aW9uX2lkIjoiZGQ3ZTZlMWQtMzk5YS00ZTYyLTgxMzYtMWNhOTEwZjUzNTI3Iiwic3Vic2NyaWJlcl9pZCI6ImQ5NTQxNGVhLWMwZDktNGRlMi1iMTAyLTRhNjc0ZDIwZTlmNyJ9.gPv2acUtNvbY-37VdrKPomJQYS_86cH3RAnCIpZQLKI; refresh_token=dd5e235ffad686de4ddad920f86e8bdbbef612c536d2af9ea29913a536c8a17b; SESSIONID=9818d3cf-96d4-4f92-8fe2-292191a5b279',
        },
      }
    );
    // TODO: The cookie above won't last forever.
    const { data } = result;
    return {
      isLive: get(data, 'currentService.content.videoStarted', false),
      eventStartTime: get(data, 'currentService.startTime'),
      media: () =>
        this.mediaUrls.length
          ? {
              sources: this.mediaUrls.map((uri) => ({
                uri,
              })),
            }
          : null,
      webViewUrl: this.webViewUrl,
    };
  }

  async getLiveStreams() {
    const { ContentItem } = this.context.dataSources;
    // This logic is a little funky right now.
    // The follow method looks at the sermon feed and the `getLiveStream` on this module
    // If we have data in the sermon feed, and the `getLiveStream.isLive` is true
    // this returns an array of livestreams
    const liveItems = await ContentItem.getActiveLiveStreamContent();
    return Promise.all(
      liveItems.map(async (item) => ({
        contentItem: item,
        ...(await this.getLiveStream()),
      }))
    );
  }
}
