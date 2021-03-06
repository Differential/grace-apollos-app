import React, { PureComponent } from 'react';
import { Image } from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import PropTypes from 'prop-types';

import { styled, BackgroundView } from '@apollosproject/ui-kit';
import {
  FeaturesFeedConnected,
  RockAuthedWebBrowser,
  VerticalCardListFeatureConnected,
} from '@apollosproject/ui-connected';

import CampaignItemListFeature from './CampaignItemListFeature';

const VerticalCardListFeatureWithCampaignComponent = (props) => (
  <VerticalCardListFeatureConnected
    {...props}
    FeaturedComponent={CampaignItemListFeature}
  />
);

const LogoTitle = styled(({ theme }) => ({
  height: theme.sizing.baseUnit * 2.5,
  margin: theme.sizing.baseUnit,
  alignSelf: 'center',
  resizeMode: 'contain',
}))(Image);

class Home extends PureComponent {
  static navigationOptions = () => ({
    header: null,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      setParams: PropTypes.func,
      navigate: PropTypes.func,
    }),
  };

  handleOnPress = ({ openUrl }) => ({ action, relatedNode }) => {
    const { navigation } = this.props;
    if (action === 'READ_CONTENT') {
      navigation.navigate('ContentSingle', {
        itemId: relatedNode.id,
        transitionKey: 2,
      });
    }
    if (action === 'READ_EVENT') {
      navigation.navigate('Event', {
        eventId: relatedNode.id,
        transitionKey: 2,
      });
    }
    if (action === 'OPEN_NODE') {
      console.warn(relatedNode);
      this.props.navigation.navigate('NodeSingle', {
        nodeId: relatedNode.id,
        transitionKey: 2,
      });
    }
    if (action === 'OPEN_URL') {
      openUrl(relatedNode.url);
    }
  };

  render() {
    return (
      <RockAuthedWebBrowser>
        {(openUrl) => (
          <BackgroundView>
            <SafeAreaView>
              <FeaturesFeedConnected
                onPressActionItem={this.handleOnPress({ openUrl })}
                additionalFeatures={{
                  VerticalCardListFeature: VerticalCardListFeatureWithCampaignComponent,
                }}
                ListHeaderComponent={
                  <LogoTitle source={require('./wordmark.png')} />
                }
              />
            </SafeAreaView>
          </BackgroundView>
        )}
      </RockAuthedWebBrowser>
    );
  }
}

export default Home;
