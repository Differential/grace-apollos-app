import ApollosConfig from '@apollosproject/config';
import { ContentItem } from '@apollosproject/data-connector-rock';
import sanitizeHTML from '@apollosproject/data-connector-rock/lib/sanitize-html';
import { get, flatten } from 'lodash';
import Color from 'color';

const {
  resolver: baseResolver,
  schema,
  dataSource: ContentItemDataSource,
} = ContentItem;

class dataSource extends ContentItemDataSource {
  byContentChannelId = (id) => {
    const cursor = this.request()
      .filter(`ContentChannelId eq ${id}`)
      .andFilter(this.LIVE_CONTENT())
      .cache({ ttl: 60 });

    if (`${id}` === '10') {
      return cursor.orderBy('Priority', 'asc');
    }
    return cursor.orderBy('StartDateTime', 'desc');
  };

  async getTheme({ id, attributeValues: { backgroundColor } = {} }) {
    const primary = get(backgroundColor, 'value');
    const type = Color(primary).luminosity() > 0.5 ? 'LIGHT' : 'DARK';

    const theme = {
      type,
      colors: {
        primary,
      },
    };

    if (!primary && id) {
      const parentItemsCursor = await this.getCursorByChildContentItemId(id);
      if (parentItemsCursor) {
        const parentItems = await parentItemsCursor.get();
        if (parentItems.length) {
          const parentThemes = flatten(
            await Promise.all(parentItems.map((i) => this.getTheme(i)))
          ).filter((v) => v);
          if (parentThemes && parentThemes.length) {
            return parentThemes[0];
          }
        }
      }
    }
    // if there's still no primary color set in the CMS, we want to return a null theme so that
    // the front end uses its default theme:
    if (!theme.colors.primary) return null;

    return theme;
  }
}

const newResolvers = {
  htmlContent: ({ content, attributeValues }) =>
    sanitizeHTML(
      `${content}\n${get(attributeValues, 'mobileDiscussionGuide.value', '')}`
    ),
  theme: (root, input, { dataSources }) =>
    dataSources.ContentItem.getTheme(root),
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
