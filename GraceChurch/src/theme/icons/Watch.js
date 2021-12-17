import React from 'react';
import PropTypes from 'prop-types';
import Svg, { Path } from 'react-native-svg';

import { makeIcon } from '@apollosproject/ui-kit';

const Icon = makeIcon(({ size = 28, fill } = {}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/Svg"
  >
    <Path
      d="M22.3125 22.5236C16.7873 23.1287 11.2126 23.1287 5.68748 22.5236C4.72805 22.4138 3.78704 21.5236 3.63425 20.5625C2.96518 16.213 2.96518 11.7869 3.63425 7.43745C3.78709 6.47631 4.728 5.58619 5.68748 5.47626C11.2126 4.8712 16.7873 4.8712 22.3125 5.47626C23.2717 5.58622 24.2131 6.47623 24.3657 7.43745C25.0348 11.7869 25.0348 16.213 24.3657 20.5625C24.213 21.5236 23.2721 22.4138 22.3125 22.5236Z"
      stroke={fill}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M17.5 14L12.25 10.5V17.5L17.5 14Z"
      stroke={fill}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
));

Icon.propTypes = {
  size: PropTypes.number,
  fill: PropTypes.string,
};

export default Icon;
