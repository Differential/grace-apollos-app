import RockApolloDataSource from '@apollosproject/rock-apollo-data-source';

class GraceGroup extends RockApolloDataSource {
  expanded = true;

  activeGroups() {
    return this.request('/Groups').filter(
      'ParentGroupId eq 15227 and IsActive eq true'
    );
  }

  getImage(group) {
    const images = this.context.dataSources.ContentItem.getImages(group).filter(
      ({ sources }) => sources.length
    );
    console.log(images);
    return images.length ? images[0] : null;
  }
}

export { GraceGroup as dataSource };
