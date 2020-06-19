import { Person } from '@apollosproject/data-connector-rock';

const { resolver, schema, dataSource: PersonDataSource } = Person;

class dataSource extends PersonDataSource {
  _getPersonas = this.getPersonas;

  getPersonas = async ({ categoryId }) => {
    const personas = this._getPersonas({ categoryId });
    if (personas.length === 0) {
      // 82 is the default data view
      return this.request('DataViews')
        .filter('Id eq 82')
        .get();
    }
    return personas;
  };
}

export { resolver, schema, dataSource };
