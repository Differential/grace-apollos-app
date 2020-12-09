import { RockConstants } from '@apollosproject/data-connector-rock';
import ApollosConfig from '@apollosproject/config';

class dataSource extends RockConstants.dataSource {
  // TODO: Delete this file when updating to 1.7
  // Same code as in 1.7
  async createOrFindInteractionComponent({
    componentName,
    channelId,
    entityId,
  }) {
    return this.findOrCreate({
      model: 'InteractionComponents',
      objectAttributes: {
        Name: componentName,
        // https://www.rockrms.com/ReleaseNotes#v11.0-core
        ...(ApollosConfig?.ROCK?.VERSION >= 11.0
          ? { InteractionChannelId: channelId }
          : { ChannelId: channelId }),
        EntityId: entityId,
      },
    });
  }
}
// eslint-disable-next-line import/prefer-default-export
export { dataSource };
