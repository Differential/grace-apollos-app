import { ContentChannel } from '@apollosproject/data-connector-rock';
import { get } from 'lodash';

const { schema } = ContentChannel;

class dataSource extends ContentChannel.dataSource {
  expanded = true;

  getName({ name, attributeValues }) {
    const titleOverride = get(attributeValues, 'apollosName.value', '');
    if (titleOverride !== '') {
      return titleOverride;
    }
    return name;
  }
}

const resolver = {
  ...ContentChannel.resolver,
  ContentChannel: {
    ...ContentChannel.resolver.ContentChannel,
    name: (root, args, { dataSources: { ContentChannel } }) =>
      ContentChannel.getName(root),
  },
};

export { schema, dataSource, resolver };
