import { Campus } from '@apollosproject/data-connector-rock';

const { dataSource, resolver: originalResolver, schema } = Campus;

const resolver = {
  ...originalResolver,
  Campus: {
    ...originalResolver.Campus,
    city: ({ location }) => location.city || '',
    postalCode: ({ location }) => location.postalCode || '',
    state: ({ location }) => location.state || '',
    street1: ({ location }) => location.street1 || '',
    street2: ({ location }) => location.street2 || '',
  },
};

export { dataSource, resolver, schema };
