import { ActionAlgorithm } from '@apollosproject/data-connector-rock';
import { get } from 'lodash';

const {
  resolver,
  schema,
  dataSource: ActionAlgorithmDataSource,
} = ActionAlgorithm;

class dataSource extends ActionAlgorithmDataSource {
  async personaFeedAlgorithm({ contentChannelId }) {
    const { ContentItem, Feature } = this.context.dataSources;
    Feature.setCacheHint({ scope: 'PRIVATE' });

    // Get the first three persona items.
    const personaFeed = await ContentItem.byPersonaFeed(3, contentChannelId);
    const items = await personaFeed.expand('ContentChannel').get();

    // Map them into specific actions.
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
}

export { resolver, schema, dataSource };
