import { ContentChannel } from '@apollosproject/data-connector-rock';
import { get } from 'lodash';

const { schema } = ContentChannel;

class dataSource extends ContentChannel.dataSource {
  expanded = true;
}

const resolver = {
  ...ContentChannel.resolver,
  ContentChannel: {
    ...ContentChannel.resolver.ContentChannel,
    name: ({ name, attributeValues }) => {
      console.log(name, attributeValues)
      const titleOverride = get(attributeValues, 'apollosName.value', '');
      if (titleOverride !== ''){
        return titleOverride;
      }
      return name;
    }
  }
}

export {
  schema,
  dataSource,
  resolver,
}