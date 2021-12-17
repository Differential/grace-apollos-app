import { Feature } from '@apollosproject/data-connector-rock';
import { createGlobalId } from '@apollosproject/server-core';
import ApollosConfig from '@apollosproject/config';
import fetch from 'node-fetch';
import { get, flatten } from 'lodash';
import moment from 'moment';

const {
  schema,
  resolver: baseResolver,
  dataSource: FeatureDataSource,
} = Feature;

const resolver = {
  ...baseResolver,
  CardListItem: {
    ...baseResolver.CardListItem,
    hasAction: (root, args, context) => {
      if (root.hasAction != null) {
        return root.hasAction;
      }
      return baseResolver.CardListItem.hasAction(root, args, context);
    },
    labelText: async (root, args, context) => {
      const isLive = await context.dataSources.ContentItem.isContentActiveLiveStream(
        { id: root.relatedNode.id }
      );

      if (isLive) {
        return 'Live';
      }

      if (
        get(root, 'relatedNode.contentChannel') &&
        get(root, 'relatedNode.contentChannel.name') === root.subtitle
      ) {
        // we have to do this because we can't get attributeValues on expanded attributes
        const contentChannel = await context.dataSources.ContentChannel.getFromId(
          root.relatedNode.contentChannel.id
        );
        return context.dataSources.ContentChannel.getName(contentChannel);
      }

      return root.subtitle;
    },
  },
};

class dataSource extends FeatureDataSource {
  ACTION_ALGORITHIMS = {
    // We need to make sure `this` refers to the class, not the `ACTION_ALGORITHIMS` object.
    ...this.ACTION_ALGORITHIMS,
    GRACE_GROUPS: this.graceGroupsAlgorithm.bind(this),
    SINGLE_IMAGE_CARD: this.singleImageCardAlgorithm.bind(this),
    MOST_RECENT_SERMON: this.mostRecentSermonAlgorithm.bind(this),
    VERSE_OF_THE_DAY: this.verseOfTheDayAlgorithm.bind(this),
    DAILY_GRACE: this.dailyGraceAlgorithm.bind(this),
    FEATURED_CAMPAIGN: this.featuredCampaignAlgorithm.bind(this),
    CAMPAIGN_ITEMS: this.campaignItemsAlgorithm.bind(this),
  };

  async featuredCampaignAlgorithm({ limit = 1 } = {}) {
    const { ContentItem } = this.context.dataSources;

    const channels = await ContentItem.byContentChannelIds(
      ApollosConfig.ROCK_MAPPINGS.PROMO_CAMPAIGN_CHANNEL_IDS
    ).get();

    const items = flatten(
      await Promise.all(
        channels.map(async ({ id, title }) => {
          const childItemsCursor = await ContentItem.getCursorByParentContentItemId(
            id
          );

          const childItems = await childItemsCursor
            .top(limit)
            .expand('ContentChannel')
            .get();

          return childItems.map((item) => ({
            ...item,
            channelSubtitle: title,
          }));
        })
      )
    );

    return items.map((item, i) => ({
      id: `${item.id}${i}`,
      title: item.title,
      subtitle: get(item, 'contentChannel.name'),
      relatedNode: { ...item, __type: ContentItem.resolveType(item) },
      image: ContentItem.getCoverImage(item),
      action: 'READ_CONTENT',
      summary: ContentItem.createSummary(item),
    }));
  }

  async dailyGraceAlgorithm() {
    const { ContentItem } = this.context.dataSources;
    const dailyGrace = await ContentItem.getDailyGrace();
    if (dailyGrace) {
      return [
        {
          id: `${dailyGrace.id}`,
          title: dailyGrace.title,
          subtitle: 'Daily Grace',
          relatedNode: {
            ...dailyGrace,
            __type: ContentItem.resolveType(dailyGrace),
          },
          image: ContentItem.getCoverImage(dailyGrace),
          action: 'READ_CONTENT',
          summary: ContentItem.createSummary(dailyGrace),
        },
      ];
    }
    return this.verseOfTheDayAlgorithm();
  }

  async verseOfTheDayAlgorithm() {
    const verseOfTheDay = await fetch(
      `https://developers.youversionapi.com/1.0/verse_of_the_day/${moment().dayOfYear()}?version_id=1`,
      {
        headers: {
          'X-YouVersion-Developer-Token': 'UKe3tMsbC7Rpt55oXjwgI4In__Y',
          'Accept-Language': 'en',
          Accept: 'application/json',
        },
      }
    ).then((result) => result.json());
    const imageUrl = get(verseOfTheDay, 'image.url', '')
      .replace('{width}', 800)
      .replace('{height}', 800);
    const title = get(verseOfTheDay, 'verse.human_reference', '');
    console.log(verseOfTheDay);
    return [
      {
        id: 'verse-of-the-day',
        title,
        subtitle: '',
        relatedNode: {
          url: get(verseOfTheDay, 'verse.url'),
          id: JSON.stringify({ verseOfTheDay }),
          __type: 'Url',
        },
        image: { sources: [{ uri: imageUrl }] },
        action: 'OPEN_URL',
        hasAction: false,
      },
    ];
  }

  async mostRecentSermonAlgorithm() {
    this.setCacheHint({ maxAge: 0 });
    const { ContentItem, LiveStream } = this.context.dataSources;
    const currentLivestream = await LiveStream.getLiveStream();
    let sermon;

    // If the livestream is live, let's the upcoming sermon.
    // The sermon is considered upcoming, because the content team doesn't publish it formally
    // until after the sermon has aired.
    if (currentLivestream && currentLivestream.isLive) {
      sermon = await ContentItem.getUpcomingSermonFeed().first();
    } else {
      sermon = await ContentItem.getSermonFeed().first();
    }
    return [
      {
        id: `${sermon.id}`,
        title: sermon.title,
        subtitle: 'Latest Message',
        relatedNode: { ...sermon, __type: ContentItem.resolveType(sermon) },
        image: ContentItem.getCoverImage(sermon),
        action: 'READ_CONTENT',
        summary: ContentItem.createSummary(sermon),
      },
    ];
  }

  async singleImageCardAlgorithm({ title, subtitle, image, url, summary }) {
    return [
      {
        id: JSON.stringify({ title, subtitle, image, url, summary }),
        title,
        subtitle,
        summary,
        relatedNode: {
          url,
          id: JSON.stringify({ url }),
          __type: 'Url',
        },
        image: { sources: [{ uri: image }] },
        action: 'OPEN_URL',
        hasAction: false,
      },
    ];
  }

  async campaignItemsAlgorithm({ limit = 1 } = {}) {
    const { ContentItem } = this.context.dataSources;

    const channels = await (await ContentItem.byPersonaFeed())
      .andFilter(
        ApollosConfig.ROCK_MAPPINGS.CAMPAIGN_CHANNEL_IDS.map(
          (id) => `(ContentChannelId eq ${id})`
        ).join(' or ')
      )
      .sort([{ field: 'Priority', direction: 'desc' }])
      .get();

    const items = flatten(
      await Promise.all(
        channels.map(async ({ id, title }) => {
          const childItemsCursor = await ContentItem.getCursorByParentContentItemId(
            id,
            { showUnpublished: true }
          );

          const childItems = await childItemsCursor
            .top(limit)
            .expand('ContentChannel')
            .get();

          return childItems.map((item) => ({
            ...item,
            channelSubtitle: title,
          }));
        })
      )
    );
    return items.map((item, i) => ({
      id: `${item.id}${i}`,
      title: item.title,
      subtitle: get(item, 'contentChannel.name'),
      relatedNode: { ...item, __type: ContentItem.resolveType(item) },
      image: ContentItem.getCoverImage(item),
      action: 'READ_CONTENT',
      summary: ContentItem.createSummary(item),
    }));
  }

  async graceGroupsAlgorithm() {
    const { GraceGroup } = this.context.dataSources;
    const groups = await GraceGroup.byActiveGroups().get();
    return groups.map((group, i) => ({
      id: `${group.id}${i}`,
      title: group.name,
      subtitle: group.description,
      relatedNode: {
        ...group,
        url: GraceGroup.getUrl(group),
        __type: 'GraceGroup',
      },
      image: GraceGroup.getImage(group),
      action: 'OPEN_URL',
      hasAction: false,
    }));
  }
}

export { schema, resolver, dataSource };
