import React from 'react';
import { styled } from '@apollosproject/ui-kit';

import ApollosLandingScreen from './ui/LandingScreen';
import FullScreenBackgroundImage from './ui/FullScreenBackgroundImage';

const FullScreenImage = styled({
  resizeMode: 'cover',
  position: 'absolute',
})(FullScreenBackgroundImage);

const LandingScreen = ({ navigation }) => (
  <ApollosLandingScreen
    onPressPrimary={() => navigation.push('Auth')}
    textColor={'white'}
    BackgroundComponent={<FullScreenImage />}
    primaryNavText={"Let's go!"}
  />
);

LandingScreen.navigationOptions = {
  header: null,
};

export default LandingScreen;
