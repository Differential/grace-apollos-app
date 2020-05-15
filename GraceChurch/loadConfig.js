
import ApollosConfig from '@apollosproject/config';
import FRAGMENTS from '@apollosproject/ui-fragments';
import gql from 'graphql-tag';

ApollosConfig.loadJs({
  FRAGMENTS: {
    ...FRAGMENTS,
    ACTION_LIST_FEATURE_FRAGMENT: gql`
      fragment ActionListFeatureFragment on ActionListFeature {
        id
        title
        subtitle
        actions {
          id
          title
          subtitle
          action
          image {
            sources {
              uri
            }
          }
          relatedNode {
            id
            ... on Url {
              url
            }
            ... on GraceGroup {
              url
            }
          }
        }
      }
    `,
HERO_LIST_FEATURE_FRAGMENT: gql`
  fragment HeroListFeatureFragment on HeroListFeature {
    id
    title
    subtitle
    actions {
      id
      title
      subtitle
      action
      image {
        sources {
          uri
        }
      }
      relatedNode {
        id
        ... on Url {
          url
        }
        ... on GraceGroup {
          url
        }
      }
    }
    heroCard {
      action
      title
      hasAction
      actionIcon
      labelText
      summary
      coverImage {
        sources {
          uri
        }
      }
      relatedNode {
        id
        ... on Url {
          url
        }
        ... on GraceGroup {
          url
        }
      }
    }
  }
`,   
  }
})