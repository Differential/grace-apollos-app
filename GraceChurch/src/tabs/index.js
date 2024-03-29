import { useEffect } from 'react';
import { Image, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  NavigationService,
  withTheme,
  useTheme,
  Icon,
  Touchable,
} from '@apollosproject/ui-kit';
import { useApolloClient } from '@apollo/client';
import {
  createFeatureFeedTab,
  UserAvatarConnected,
  VerticalCardListFeatureConnected,
} from '@apollosproject/ui-connected';
import { checkOnboardingStatusAndNavigate } from '@apollosproject/ui-onboarding';
import CampaignItemListFeature from '../ui/CampaignItemListFeature';
import tabBarIcon from './tabBarIcon';

const VerticalCardListFeatureWithCampaignComponent = (props) => (
  <VerticalCardListFeatureConnected
    {...props}
    FeaturedComponent={CampaignItemListFeature}
  />
);

const HeaderLogo = withTheme(({ theme }) => ({
  style: {
    height: theme.sizing.baseUnit * 2.5,
    width: '50%',
    resizeMode: 'contain',
  },
  source:
    theme.type === 'light'
      ? require('./wordmark.png')
      : require('./wordmark.dark.png'),
}))(Image);

const ProfileButton = () => {
  const navigation = useNavigation();
  return (
    <Touchable
      onPress={() => {
        navigation.navigate('UserSettingsNavigator');
      }}
    >
      <View>
        <UserAvatarConnected size="xsmall" />
      </View>
    </Touchable>
  );
};

const SearchButton = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  return (
    <Touchable
      onPress={() => {
        navigation.navigate('Search');
      }}
    >
      <Icon
        name="search"
        size={theme.sizing.baseUnit * 1.5}
        fill={theme.colors.primary}
      />
    </Touchable>
  );
};

// we nest stack inside of tabs so we can use all the fancy native header features
const HomeTab = createFeatureFeedTab({
  screenOptions: {
    headerHideShadow: true,
    headerCenter: HeaderLogo,
    headerLeft: ProfileButton,
    headerLargeTitle: false,
  },
  tabName: 'Home',
  feedName: 'HOME',
  additionalFeatures: {
    VerticalCardListFeature: VerticalCardListFeatureWithCampaignComponent,
  },
});

const ExploreTab = createFeatureFeedTab({
  screenOptions: {
    headerRight: SearchButton,
  },
  options: {
    headerLeft: ProfileButton,
  },
  tabName: 'Explore',
  feedName: 'READ',
});

const WatchTab = createFeatureFeedTab({
  options: {
    headerLeft: ProfileButton,
  },
  tabName: 'Watch',
  feedName: 'WATCH',
});

const ConnectTab = createFeatureFeedTab({
  options: {
    headerLeft: ProfileButton,
  },
  tabName: 'Connect',
  feedName: 'CONNECT',
});

const { Navigator, Screen } = createBottomTabNavigator();

const TabNavigator = () => {
  const client = useApolloClient();
  // this is only used by the tab loaded first
  // if there is a new version of the onboarding flow,
  // we'll navigate there first to show new screens
  useEffect(() => {
    checkOnboardingStatusAndNavigate({
      client,
      navigation: NavigationService,
      navigateHome: false,
    });
  }, [client]);

  const theme = useTheme();
  let activeColor = theme.colors.primary;

  return (
    <Navigator lazy tabBarOptions={{ activeTintColor: activeColor }}>
      <Screen
        name="Home"
        component={HomeTab}
        options={{ tabBarIcon: tabBarIcon('house') }}
      />
      <Screen
        name="Watch"
        component={WatchTab}
        options={{ tabBarIcon: tabBarIcon('watch') }}
      />
      <Screen
        name="Explore"
        component={ExploreTab}
        options={{ tabBarIcon: tabBarIcon('explore') }}
      />
      <Screen
        name="Connect"
        component={ConnectTab}
        options={{ tabBarIcon: tabBarIcon('profile') }}
      />
    </Navigator>
  );
};

export default TabNavigator;
