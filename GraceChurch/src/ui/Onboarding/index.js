import React from 'react';
import { View } from 'react-native';
import {
  checkNotifications,
  openSettings,
  requestNotifications,
  RESULTS,
} from 'react-native-permissions';
import { styled, BackgroundView } from '@apollosproject/ui-kit';
import {
  AskNotificationsConnected,
  LocationFinderConnected,
  OnboardingSwiper,
} from '@apollosproject/ui-onboarding';
import { Query } from 'react-apollo';
import { onboardingComplete, WITH_USER_ID } from './onboardingStatus';

const FullscreenBackgroundView = styled({
  position: 'absolute',
  width: '100%',
  height: '100%',
})(BackgroundView);

const Spacer = styled(() => ({
  maxHeight: '10%',
  flex: 1,
}))(View);

function Onboarding({ navigation }) {
  return (
    <>
      <FullscreenBackgroundView />
      <OnboardingSwiper>
        {({ swipeForward }) => (
          <>
            <LocationFinderConnected
              onPressPrimary={swipeForward}
              onNavigate={() => {
                navigation.navigate('Location');
              }}
              BackgroundComponent={<Spacer />}
            />
            <Query query={WITH_USER_ID} fetchPolicy="network-only">
              {({
                data: { currentUser: { id } = { currentUser: { id: null } } },
              }) => (
                <AskNotificationsConnected
                  onRequestPushPermissions={(update) => {
                    checkNotifications().then((checkRes) => {
                      if (checkRes.status === RESULTS.DENIED) {
                        requestNotifications(['alert', 'badge', 'sound']).then(
                          () => {
                            update();
                          }
                        );
                      } else {
                        openSettings();
                      }
                    });
                  }}
                  onPressPrimary={() => {
                    onboardingComplete({ userId: id });
                    navigation.replace('Tabs');
                  }}
                  primaryNavText={'Finish'}
                  BackgroundComponent={<Spacer />}
                />
              )}
            </Query>
          </>
        )}
      </OnboardingSwiper>
    </>
  );
}

Onboarding.navigationOptions = {
  title: 'Onboarding',
  header: null,
  gesturesEnabled: false,
};

export default Onboarding;
