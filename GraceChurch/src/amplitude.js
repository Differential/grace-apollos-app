import { Amplitude } from '@amplitude/react-native';
import ApollosConfig from '@apollosproject/config';
import gql from 'graphql-tag';
import { get } from 'lodash';
import { getVersion } from 'react-native-device-info';
import { client } from './client';

Amplitude.getInstance().init(ApollosConfig.AMPLITUDE_KEY, null, {
  useNativeDeviceInfo: true,
});

export const track = ({ eventName, properties = null }) => {
  Amplitude.getInstance().logEvent(eventName, properties);
};

export const identify = () => {
  const data = client.readQuery({
    query: gql`
      query currentCampusId {
        currentUser {
          id
          profile {
            id
            campus {
              id
              name
            }
          }
        }
      }
    `,
  });

  // The functions called next throw an error in development, so we bypass them early.
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'testing'
  ) {
    return;
  }

  Amplitude.getInstance().setUserId(get(data, 'currentUser.profile.id'));

  Amplitude.getInstance().setUserProperties({
    campusName: get(data, 'currentUser.profile.campus.name'),
    appVersion: getVersion(),
  });
};
