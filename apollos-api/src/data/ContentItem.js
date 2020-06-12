import ApollosConfig from '@apollosproject/config';
import { ContentItem } from '@apollosproject/data-connector-rock';
import sanitizeHTML from '@apollosproject/data-connector-rock/lib/sanitize-html';
import { get } from 'lodash';
import moment from 'moment';

const {
  resolver: baseResolver,
  schema,
  dataSource: ContentItemDataSource,
} = ContentItem;

class dataSource extends ContentItemDataSource {
  byContentChannelId = (id) => {
    const cursor = this.request()
      .filter(`ContentChannelId eq ${id}`)
      .andFilter(this.LIVE_CONTENT())
      .cache({ ttl: 60 });

    if (`${id}` === '10') {
      return cursor.orderBy('Priority', 'asc');
    }
    return cursor.orderBy('StartDateTime', 'desc');
  };

  ACTIVE_CONTENT = () => {
    // get a date in the local timezone of the rock instance.
    // will create a timezone formatted string and then strip off the offset
    // should output something like 2019-03-27T12:27:20 which means 12:27pm in New York
    const date = moment()
      .tz(ApollosConfig.ROCK.TIMEZONE)
      .format()
      .split(/[-+]\d+:\d+/)[0];
    const filter = `(((StartDateTime lt datetime'${date}') or (StartDateTime eq null)) and ((ExpireDateTime gt datetime'${date}') or (ExpireDateTime eq null)))`;
    return get(ApollosConfig.ROCK, 'SHOW_INACTIVE_CONTENT', false)
      ? null
      : filter;
  };

  getUpcomingSermonFeed() {
    return this.request()
      .filter(
        `ContentChannelId eq ${ApollosConfig.ROCK_MAPPINGS.SERMON_CHANNEL_ID}`
      )
      .andFilter(this.ACTIVE_CONTENT())
      .orderBy('StartDateTime', 'desc');
  }

  getDailyGrace = () =>
    this.request()
      .andFilter('ContentChannelId eq 16')
      .andFilter(
        `StartDateTime eq datetime'${moment().format('YYYY-MM-DD')}T00:00:00'`
      )
      .andFilter(this.LIVE_CONTENT())
      .first();
}

const newResolvers = {
  htmlContent: ({ content, attributeValues }) =>
    sanitizeHTML(
      `${content}\n${get(attributeValues, 'mobileDiscussionGuide.value', '')}`
    ),
};

const contentItemTypes = Object.keys(ApollosConfig.ROCK_MAPPINGS.CONTENT_ITEM);

const resolver = contentItemTypes.reduce(
  (acc, curr) => ({
    ...acc,
    [curr]: { ...baseResolver[curr], ...newResolvers },
  }),
  {
    ...baseResolver,
  }
);

export { resolver, schema, dataSource };
