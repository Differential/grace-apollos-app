import { StyleSheet } from 'react-native';
import { get } from 'lodash';

import {
  DefaultCard,
  HighlightCard,
  FeaturedCard,
  styled,
} from '@apollosproject/ui-kit';
import ImageCard from '../ui/ImageCard';
import fontStack from './fontStack';
import FullScreenBackgroundImage from '../ui/FullScreenBackgroundImage';

const cardMapper = (props) => {
  // map typename to the the card we want to render.
  if (props.isFeatured) {
    return <FeaturedCard {...props} />;
  }
  switch (get(props, '__typename')) {
    case 'Url':
      if (!props.title && !props.subtitle) {
        return <ImageCard {...props} />;
      }
      return <HighlightCard {...props} />;

    case 'MediaContentItem':
    case 'WeekendContentItem':
    case 'ContentSeriesContentItem':
    case 'DevotionalContentItem':
      return <HighlightCard {...props} />;
    default:
      return <DefaultCard {...props} />;
  }
};

// import styleOverrides from './styleOverrides';
// import propOverrides from './propOverrides';

/* Add your custom theme definitions below. Anything that is supported in UI-Kit Theme can be
 overridden and/or customized here! */

/* Base colors.
 * These get used by theme types (see /types directory) to color
 * specific parts of the interface. For more control on how certain
 * elements are colored, go there. The next level of control comes
 * on a per-component basis with "overrides"
 */
const colors = {
  primary: '#2F97A0',
  secondary: '#1C3B6B',

  alert: '#C64F55',

  // Dark shades
  darkPrimary: '#323232',
  darkSecondary: '#505050',
  darkTertiary: '#B8B8B8',

  // Light shades
  lightPrimary: '#F8F8F8',
  lightSecondary: '#E3E3E3',
  lightTertiary: '#DCDCDC',

  // Statics
  wordOfChrist: '#8b0000', // only used in Scripture.
  background: {
    accent: '#9BCBEB',
  },
};

const overlays = {
  'no-overlay': () => () => ({
    colors: ['transparent', 'transparent'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
    locations: [0, 1],
  }),
};

/* Base Typography sizing and fonts.
 * To control speicfic styles used on different type components (like H1, H2, etc), see "overrides"
 */
export const typography = {
  ...fontStack,
};

/* Responsive breakpoints */
// export const breakpoints = {};

/* Base sizing units. These are used to scale
 * space, and size components relatively to one another.
 */
// export const sizing = {};

/* Base alpha values. These are used to keep transparent values across the app consistant */
// export const alpha = {};

/* Base overlays. These are used as configuration for LinearGradients across the app */
// export const overlays = () => ({});

/* Overrides allow you to override the styles of any component styled using the `styled` HOC. You
 * can also override the props of any component using the `withTheme` HOC. See examples below:
 * ```const StyledComponent = styled({ margin: 10, padding: 20 }, 'StyledComponent');
 *    const PropsComponent = withTheme(({ theme }) => ({ fill: theme.colors.primary }), 'PropsComponent');
 * ```
 * These componnents can have their styles/props overriden by including the following overrides:
 * ```{
 *   overides: {
 *     StyledComponent: {
 *       margin: 5,
 *       padding: 15,
 *     },
 *     // #protip: you even have access 👇to component props! This applies to style overrides too 💥
 *     PropsComponent: () => ({ theme, isActive }) => ({
 *       fill: isActive ? theme.colors.secondary : theme.colors.primary,
 *     }),
 *   },
 * }
 * ```
 */
// const overrides = {
//   ...styleOverrides,
//   ...propOverrides,
// };

const FullScreenImage = styled({
  resizeMode: 'cover',
  ...StyleSheet.absoluteFill,
})(FullScreenBackgroundImage);

const overrides = {
  H1: {
    fontFamily: typography.sans.light.default,
  },
  H2: {
    fontFamily: typography.sans.light.default,
  },
  H3: {
    fontFamily: typography.sans.black.default,
    textTransform: 'uppercase',
  },
  H4: {
    fontFamily: typography.sans.black.default,
  },
  H5: {
    fontFamily: typography.sans.regular.default,
  },
  H6: {
    fontFamily: typography.sans.regular.default,
  },
  ContentCardComponentMapper: {
    Component: () => cardMapper,
  },
  'HeroListFeature.Subtitle': ({ helpers: themeHelpers }) => ({
    fontFamily: typography.sans.light.default,
    textTransform: 'capitalize',
    fontSize: themeHelpers.rem(1.5),
  }),
  'ui-onboarding.Landing': {
    BackgroundComponent: () => <FullScreenImage />,
    textColor: 'white',
  },
  'ui-kit.ChannelLabel.Wrapper': (theme) => ({
    paddingBottom: theme.sizing.baseUnit * 0.5,
  }),
  'ui-onboarding.Landing.Title': (theme) => ({
    marginTop: theme.sizing.baseUnit * 2,
  }),
  'ui-kit.inputs.Search.styles.TextInputWrapper': (theme) => ({
    paddingLeft: theme.sizing.baseUnit,
  }),
  'ui-kit.BackgroundImageBlur.BlurredImage': {
    source: '',
  },
};

export default { colors, overrides, overlays, typography };
