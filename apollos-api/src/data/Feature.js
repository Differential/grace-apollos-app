import { Feature } from '@apollosproject/data-connector-rock';
import { createGlobalId } from '@apollosproject/server-core';

const { schema, resolver, dataSource: FeatureDataSource } = Feature;

class dataSource extends FeatureDataSource {
  ACTION_ALGORITHIMS = {
    // We need to make sure `this` refers to the class, not the `ACTION_ALGORITHIMS` object.
    ...this.ACTION_ALGORITHIMS,
    GRACE_GROUPS: this.graceGroupsAlgorithm.bind(this),
  };

  async graceGroupsAlgorithm() {
    const { GraceGroup } = this.context.dataSources;
    const groups = await GraceGroup.activeGroups().get();
    return groups.map((group, i) => ({
      id: createGlobalId(`${group.id}${i}`, 'ActionListAction'),
      title: group.name,
      subtitle: group.description,
      // relatedNode: { ...event, __type: 'Event' },
      image: GraceGroup.getImage(group),
      action: 'READ_CONTENT',
    }));
  }
}

export { schema, resolver, dataSource };
