import RockApolloDataSource from '@apollosproject/rock-apollo-data-source';
import gql from 'graphql-tag';

class GraceGroup extends RockApolloDataSource {
  expanded = true;

  activeGroups() {
    return this.request('/Groups').filter(
      'ParentGroupId eq 15227 and IsActive eq true'
    );
  }

  getUrl({ id }) {
    return `https://trygrace.org/page/724?GroupId=${id}`;
  }

  getImage(group) {
    const images = this.context.dataSources.ContentItem.getImages(group).filter(
      ({ sources }) => sources.length
    );
    return images.length ? images[0] : null;
  }
}

const schema = gql`
  type GraceGroup implements Node {
    url: String
    id: ID!
  }
`;

export { GraceGroup as dataSource, schema };
