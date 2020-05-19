import { Feature } from '@apollosproject/data-connector-rock';
import { createGlobalId } from '@apollosproject/server-core';
import gql from 'graphql-tag';

const {
  schema: baseSchema,
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
      return root.subtitle;
    },
  },
};

const schema = gql`
  ${baseSchema}

  extend enum ACTION_FEATURE_ACTION {
    OPEN_URL
  }

  type Url implements Node {
    url: String
    id: ID!
  }
`;

class dataSource extends FeatureDataSource {
  ACTION_ALGORITHIMS = {
    // We need to make sure `this` refers to the class, not the `ACTION_ALGORITHIMS` object.
    ...this.ACTION_ALGORITHIMS,
    GRACE_GROUPS: this.graceGroupsAlgorithm.bind(this),
    SINGLE_IMAGE_CARD: this.singleImageCardAlgorithm.bind(this),
    MOST_RECENT_SERMON: this.mostRecentSermonAlgorithm.bind(this),
  };

  async mostRecentSermonAlgorithm() {
    const { ContentItem } = this.context.dataSources;
    const sermon = await ContentItem.getSermonFeed().first();
    return [
      {
        id: createGlobalId(`${sermon.id}`, 'ActionListAction'),
        title: sermon.title,
        subtitle: 'Current Message',
        relatedNode: { ...sermon, __type: ContentItem.resolveType(sermon) },
        image: ContentItem.getCoverImage(sermon),
        action: 'READ_CONTENT',
        summary: ContentItem.createSummary(sermon),
      },
    ];
  }

  async singleImageCardAlgorithm({ title, subtitle, image, url }) {
    return [
      {
        id: createGlobalId(
          JSON.stringify({ title, subtitle, image, url }),
          'ActionListAction'
        ),
        title,
        subtitle,
        relatedNode: {
          url,
          id: createGlobalId(JSON.stringify({ url }), 'Url'),
          __type: 'Url',
        },
        image: { sources: [{ uri: image }] },
        action: 'OPEN_URL',
        hasAction: false,
      },
    ];
  }

  async graceGroupsAlgorithm() {
    const { GraceGroup } = this.context.dataSources;
    const groups = await GraceGroup.activeGroups().get();
    return groups.map((group, i) => ({
      id: createGlobalId(`${group.id}${i}`, 'ActionListAction'),
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
