import React from 'react';
import { Linking } from 'react-native';
import { ActionBar, ActionBarItem } from '@apollosproject/ui-kit';
import { withNavigation } from 'react-navigation';
import PropTypes from 'prop-types';
import { RockAuthedWebBrowser } from '@apollosproject/ui-connected';

const Toolbar = ({ navigation }) => (
  <RockAuthedWebBrowser>
    {(openUrl) => (
      <ActionBar>
        {/* <ActionBarItem */}
        {/*   onPress={() => navigation.navigate('Passes')} */}
        {/*   icon="check" */}
        {/*   label="Check-in" */}
        {/* /> */}
        <ActionBarItem
          onPress={() => Linking.openURL('https://trygrace.org/give')}
          icon="download"
          label="Give"
        />
        <ActionBarItem
          onPress={() => openUrl('https://trygrace.org/visit')}
          icon="information"
          label="Visit"
        />
      </ActionBar>
    )}
  </RockAuthedWebBrowser>
);

Toolbar.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

export default withNavigation(Toolbar);
