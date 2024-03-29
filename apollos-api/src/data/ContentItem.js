import ApollosConfig from '@apollosproject/config';
import { ContentItem } from '@apollosproject/data-connector-rock';
import sanitizeHTML from 'sanitize-html';
import { get } from 'lodash';
import moment from 'moment';
import { isSunday, previousSunday, format, nextSunday } from 'date-fns';

const {
  resolver: baseResolver,
  schema,
  dataSource: ContentItemDataSource,
} = ContentItem;

const { ROCK_MAPPINGS } = ApollosConfig;

class dataSource extends ContentItemDataSource {
  // Generates feed based on persons dataview membership
  // This is hardcoded to accept 2 contentChannelIds
  byPersonaFeed = async (limit, contentChannelIds) => {
    const {
      dataSources: { Persona },
    } = this.context;

    // Grabs the guids associated with all dataviews user is memeber
    const getPersonaGuidsForUser = await Persona.getPersonas({
      categoryId: ROCK_MAPPINGS.DATAVIEW_CATEGORIES.PersonaId,
    });

    if (getPersonaGuidsForUser.length === 0) {
      return this.request().empty();
    }

    // Rely on custom code without the plugin.
    // Use plugin, if the user has set USE_PLUGIN to true.
    // In general, you should ALWAYS use the plugin if possible.
    const endpoint = get(ApollosConfig, 'ROCK.USE_PLUGIN', false)
      ? 'Apollos/ContentChannelItemsByDataViewGuids'
      : 'ContentChannelItems/GetFromPersonDataView';

    // Grabs content items based on personas
    return this.request(
      `${endpoint}?guids=${getPersonaGuidsForUser
        .map((obj) => obj.guid)
        .join()}`
    )
      .andFilter(this.LIVE_CONTENT())
      .andFilter(
        contentChannelIds[1]
          ? `ContentChannelId eq ${
              contentChannelIds[0]
            } or ContentChannelId eq ${contentChannelIds[1]}`
          : ''
      )
      .top(limit)
      .orderBy('Priority', 'desc');
  };

  byContentChannelId = (id) => {
    const cursor = this.request()
      .filter(`ContentChannelId eq ${id}`)
      .cache({ ttl: 60 });
    // Leaders
    if (`${id}` === '10') {
      return cursor.andFilter(this.LIVE_CONTENT()).orderBy('Priority', 'desc');
    }
    // Messages
    if (`${id}` === '4') {
      return cursor
        .andFilter(this.LIVE_AND_EXPIRED())
        .orderBy('StartDateTime', 'desc');
    }
    return cursor
      .andFilter(this.LIVE_CONTENT())
      .orderBy('StartDateTime', 'desc');
  };

  byContentChannelIds = (ids = []) => {
    const cursor = this.request()
      .filterOneOf(ids.map((id) => `ContentChannelId eq ${id}`))
      .cache({ ttl: 60 });
    // Leaders, Compassion, Community, Resources
    if (
      ids.includes(10) ||
      ids.includes(22) ||
      ids.includes(23) ||
      ids.includes(25)
    ) {
      return cursor.andFilter(this.LIVE_CONTENT()).orderBy('Priority', 'desc');
    }
    // Messages
    if (ids.includes(4)) {
      return cursor
        .andFilter(this.LIVE_AND_EXPIRED())
        .orderBy('StartDateTime', 'desc');
    }
    return cursor
      .andFilter(this.LIVE_CONTENT())
      .orderBy('StartDateTime', 'desc');
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

  getCursorByChildContentItemId = async (id, { showEnded = false } = {}) => {
    const associations = await this.request('ContentChannelItemAssociations')
      .filter(`ChildContentChannelItemId eq ${id}`)
      .cache({ ttl: 60 })
      .get();

    if (!associations || !associations.length) return this.request().empty();

    return this.getFromIds(
      associations.map(({ contentChannelItemId }) => contentChannelItemId),
      showEnded ? this.LIVE_AND_EXPIRED : this.LIVE_CONTENT
    ).sort(this.DEFAULT_SORT());
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

  LIVE_AND_EXPIRED = () => {
    // get a date in the local timezone of the rock instance.
    // will create a timezone formatted string and then strip off the offset
    // should output something like 2019-03-27T12:27:20 which means 12:27pm in New York
    const date = moment()
      .tz(ApollosConfig.ROCK.TIMEZONE)
      .format()
      .split(/[-+]\d+:\d+/)[0];
    const filter = `((StartDateTime lt datetime'${date}') or (StartDateTime eq null)) and (((Status eq 'Approved') or (ContentChannel/RequiresApproval eq false)))`;
    return get(ApollosConfig.ROCK, 'SHOW_INACTIVE_CONTENT', false)
      ? null
      : filter;
  };

  async getCoverImage(root) {
    const { Cache } = this.context.dataSources;
    const cachedValue = await Cache.get({
      key: `contentItem:coverImage:${root.id}`,
    });

    if (cachedValue) {
      return cachedValue;
    }

    let image = null;

    // filter images w/o URLs
    const ourImages = this.getImages(root).filter(
      ({ sources }) => sources.length
    );

    if (ourImages.length) {
      image = this.pickBestImage({ images: ourImages });
    }

    // If no image, check parent for image:
    if (!image) {
      // The cursor returns a promise which returns a promisee, hence th edouble eawait.
      const parentItems = await (await this.getCursorByChildContentItemId(
        root.id,
        { showEnded: true } // DIFFERENT THAN CORE
      )).get();

      if (parentItems.length) {
        const validParentImages = parentItems
          .flatMap(this.getImages)
          .filter(({ sources }) => sources.length);

        if (validParentImages && validParentImages.length) {
          image = this.pickBestImage({ images: validParentImages });
        }
      }
    }

    if (image != null) {
      Cache.set({ key: `contentItem:coverImage:${root.id}`, data: image });
    }

    return image;
  }

  getUpcomingSermonFeed() {
    return this.request()
      .filter(
        `ContentChannelId eq ${ApollosConfig.ROCK_MAPPINGS.SERMON_CHANNEL_ID}`
      )
      .andFilter(this.ACTIVE_CONTENT())
      .orderBy('StartDateTime', 'desc');
  }

  getWeeklyGrace = async (limit) => {
    const sunday = isSunday(Date.now())
      ? Date.now()
      : previousSunday(Date.now());
    return (
      this.request()
        .andFilter('ContentChannelId eq 16')
        .andFilter(
          `StartDateTime ge datetime'${format(sunday, 'yyyy-MM-dd')}T00:00:00'`
        )
        .andFilter(
          `StartDateTime lt datetime'${format(
            nextSunday(Date.now()),
            'yyyy-MM-dd'
          )}T00:00:00'`
        )
        // .andFilter(this.LIVE_CONTENT())
        .top(limit)
        .get()
    );
  };

  getActiveLiveStreamContent = async () => {
      return [];
//     const { LiveStream } = this.context.dataSources;
//     const { isLive } = await LiveStream.getLiveStream();
//     // if there is no live stream, then there is no live content. Easy enough!
//     if (!isLive) return [];

//     const mostRecentSermon = await this.getUpcomingSermonFeed().first();
//     return [mostRecentSermon];
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
