import PropTypes from 'prop-types';
import Svg, { Path, Line } from 'react-native-svg';

import { makeIcon } from '@apollosproject/ui-kit';

const Icon = makeIcon(({ size = 32, fill } = {}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 256 256"
    fill={fill}
    xmlns="http://www.w3.org/2000/svg"
  >
    <Path
      d="M216,216V115.53887a8,8,0,0,0-2.6185-5.91942L133.376,36.88436a8,8,0,0,0-10.76339.00036l-79.9945,72.73477A8,8,0,0,0,40,115.53855V216"
      fill="none"
      stroke={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="16"
    />
    <Line
      x1="16"
      y1="216"
      x2="240"
      y2="216"
      fill="none"
      stroke={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="16"
    />
    <Path
      d="M151.99414,215.99158v-56a8,8,0,0,0-8-8h-32a8,8,0,0,0-8,8v56"
      fill="none"
      stroke={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="16"
    />
  </Svg>
));

Icon.propTypes = {
  size: PropTypes.number,
  fill: PropTypes.string,
};

export default Icon;
