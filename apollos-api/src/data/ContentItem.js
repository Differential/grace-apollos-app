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

  getFromIds = (ids = [], filter = this.LIVE_CONTENT) => {
    if (ids.length === 0) return this.request().empty();
    if (get(ApollosConfig, 'ROCK.USE_PLUGIN', false)) {
      // Avoids issue when fetching more than ~10 items
      // Caused by an Odata node limit.
      return this.request(
        `Apollos/GetContentChannelItemsByIds?ids=${ids.join(',')}`
      ).andFilter(filter());
    }
    return this.request()
      .filterOneOf(ids.map((id) => `Id eq ${id}`))
      .andFilter(filter());
  };

  getCursorByParentContentItemId = async (
    id,
    { showUnpublished = false } = {}
  ) => {
    const associations = await this.request('ContentChannelItemAssociations')
      .filter(`ContentChannelItemId eq ${id}`)
      .cache({ ttl: 60 })
      .get();

    if (!associations || !associations.length) return this.request().empty();

    return this.getFromIds(
      associations.map(
        ({ childContentChannelItemId }) => childContentChannelItemId
      ),
      showUnpublished ? this.ACTIVE_CONTENT : this.LIVE_CONTENT
    ).sort(this.DEFAULT_SORT());
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

  byPersonaFeed(){
    
  }

  getDailyGrace = () =>
    this.request()
      .andFilter('ContentChannelId eq 16')
      .andFilter(
        `StartDateTime eq datetime'${moment().format('YYYY-MM-DD')}T00:00:00'`
      )
      .andFilter(this.LIVE_CONTENT())
      .first();

  getActiveLiveStreamContent = async () => {
    const { LiveStream } = this.context.dataSources;
    const { isLive } = await LiveStream.getLiveStream();
    // if there is no live stream, then there is no live content. Easy enough!
    if (!isLive) return [];

    const mostRecentSermon = await this.getUpcomingSermonFeed().first();
    return [mostRecentSermon];
  };
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
