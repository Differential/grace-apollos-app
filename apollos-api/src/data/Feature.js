import { Feature } from '@apollosproject/data-connector-rock';
import ApollosConfig from '@apollosproject/config';
import { get, flatten } from 'lodash';
import { format } from 'date-fns';

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
    WEEKLY_SCRIPTURE: this.weeklyGraceAlgorithm.bind(this),
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
      subtitle: '',
      relatedNode: { ...item, __type: ContentItem.resolveType(item) },
      image: ContentItem.getCoverImage(item),
      action: 'READ_CONTENT',
      summary: ContentItem.createSummary(item),
    }));
  }

  async weeklyGraceAlgorithm({ limit = 1, showDate = false }) {
    const { ContentItem } = this.context.dataSources;
    const items = await ContentItem.getWeeklyGrace(limit);
    return items.map((item) => ({
      id: `${item.id}`,
      title: item.title,
      subtitle: showDate
        ? format(new Date(item.startDateTime), 'E, MMM d')
        : '',
      relatedNode: {
        ...item,
        __type: ContentItem.resolveType(item),
      },
      image: ContentItem.getCoverImage(item),
      action: 'READ_CONTENT',
      summary: ContentItem.createSummary(item),
    }));
  }

  async mostRecentSermonAlgorithm({ limit = 4 }) {
    this.setCacheHint({ maxAge: 0 });
    const { ContentItem, LiveStream } = this.context.dataSources;
    const currentLivestream = await LiveStream.getLiveStream();
    let sermons;

    // If the livestream is live, let's the upcoming sermon.
    // The sermon is considered upcoming, because the content team doesn't publish it formally
    // until after the sermon has aired.
    if (currentLivestream && currentLivestream.isLive) {
      sermons = await ContentItem.getUpcomingSermonFeed()
        .top(limit)
        .get();
    } else {
      sermons = await ContentItem.getSermonFeed()
        .top(limit)
        .get();
    }
    return sermons.map((sermon) => ({
      id: `${sermon.id}`,
      title: sermon.title,
      subtitle: 'Latest Message',
      relatedNode: { ...sermon, __type: ContentItem.resolveType(sermon) },
      image: ContentItem.getCoverImage(sermon),
      action: 'READ_CONTENT',
      summary: ContentItem.createSummary(sermon),
    }));
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
            .sort([
              { field: 'Priority', direction: 'desc' },
              { field: 'StartDateTime', direction: 'asc' },
            ])
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
      subtitle: '',
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

  async createActionListFeature({
    algorithms = [],
    actions = [],
    title,
    subtitle,
    primaryAction,
    id,
    ...args
  }) {
    // Generate a list of actions.
    const { ActionAlgorithm } = this.context.dataSources;

    // Run algorithms if we have them, otherwise pull from the config
    const compiledActions = () =>
      actions.length
        ? actions.map((action) => this.attachActionIds(action))
        : ActionAlgorithm.runAlgorithms({ algorithms, args });

    // Ensures that we have a generated ID for the Primary Action related node, if not provided.
    if (primaryAction) {
      // eslint-disable-next-line no-param-reassign
      primaryAction = this.attachActionIds(primaryAction);
    }

    return {
      // The Feature ID is based on all of the action ids, added together.
      // This is naive, and could be improved.
      id: this.createFeatureId({
        id,
        args: {
          algorithms,
          title,
          subtitle,
          actions,
          primaryAction,
          ...args,
        },
      }),
      actions: compiledActions,
      title,
      subtitle,
      primaryAction,
      // Typanme is required so GQL knows specifically what Feature is being created
      __typename: 'ActionListFeature',
    };
  }
}

export { schema, resolver, dataSource };
