import ApollosConfig from '@apollosproject/config';
import FRAGMENTS from '@apollosproject/ui-fragments';
import gql from 'graphql-tag';

ApollosConfig.loadJs({
  FRAGMENTS: {
    ...FRAGMENTS,
    RELATED_NODE_FRAGMENT: gql`
      fragment RelatedFeatureNodeFragment on Node {
        id
        ... on Url {
          url
        }
        ... on GraceGroup {
          url
        }
      }
    `,
  },
});
