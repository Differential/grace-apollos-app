import React from 'react';
import { Image } from 'react-native';
import PropTypes from 'prop-types';
import { makeIcon } from '@apollosproject/ui-kit';

const Icon = makeIcon(({ size = 64, fill, ...otherProps } = {}) => (
  <Image source={require('./logo.png')} style={{ width: size, height: size }} />
));

Icon.propTypes = {
  size: PropTypes.number,
  fill: PropTypes.string,
};

export default Icon;
