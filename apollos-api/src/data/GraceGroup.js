import RockApolloDataSource from '@apollosproject/rock-apollo-data-source';
import gql from 'graphql-tag';

class GraceGroup extends RockApolloDataSource {
  expanded = true;

  byActiveGroups() {
    return this.request('/Groups').filter(
      'ParentGroupId eq 15227 and IsActive eq true'
    );
  }

  async getUrl({ id }) {
    const groupForm = (await this.request('/Groups')
      .filter(`ParentGroupId eq ${id} and IsActive eq true`)
      .get()).find(({ name }) => name.includes('Form'));
    const formId = groupForm ? groupForm.id : id;
    return `https://trygrace.org/page/724?GroupId=${formId}`;
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
