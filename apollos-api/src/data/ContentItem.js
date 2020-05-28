import ApollosConfig from '@apollosproject/config';
import { ContentItem } from '@apollosproject/data-connector-rock';
import sanitizeHTML from '@apollosproject/data-connector-rock/lib/sanitize-html';
import { get } from 'lodash';

const { resolver: baseResolver, schema, dataSource } = ContentItem;

const newResolvers = {
  htmlContent: ({ content, attributeValues }) =>
    sanitizeHTML(
      `${content}\n${get(attributeValues, 'mobileDiscussionGuide.value', '')}`
    ),
};

const contentItemTypes = Object.keys(ApollosConfig.ROCK_MAPPINGS.CONTENT_ITEM);

const resolver = contentItemTypes.reduce(
  (acc, curr) => ({
    ...acc,
    [curr]: { ...baseResolver[curr], ...newResolvers },
  }),
  baseResolver
);

export { resolver, schema, dataSource };
