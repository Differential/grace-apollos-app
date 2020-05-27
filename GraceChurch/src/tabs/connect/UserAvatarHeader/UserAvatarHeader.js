import React from 'react';
import { Query } from 'react-apollo';
import PropTypes from 'prop-types';
import { withNavigation } from 'react-navigation';
import { get } from 'lodash';

import { H2, styled, PaddedView } from '@apollosproject/ui-kit';
import { UserAvatarConnected } from '@apollosproject/ui-connected';
import GET_USER_PROFILE from './getUserProfile';

const GetUserProfile = ({ children }) => (
  <Query query={GET_USER_PROFILE}>
    {({ data: { currentUser = {} } = {} }) => {
      const firstName = get(currentUser, 'profile.firstName');
      return children({ firstName });
    }}
  </Query>
);

GetUserProfile.propTypes = {
  children: PropTypes.func.isRequired,
};

const Container = styled({
  alignItems: 'center',
  justifyContent: 'center',
})(PaddedView);

const StyledH2 = styled(({ theme: { sizing } }) => ({
  fontSize: sizing.baseUnit * 2,
}))(H2);

const UserAvatarHeader = ({
  buttonIcon,
  message,
  navigation,
  onPressIcon,
  size,
  ...props
}) => (
  <Container>
    <PaddedView horizontal={false}>
      <UserAvatarConnected
        size={size}
        buttonIcon={buttonIcon}
        onPressIcon={() => navigation.navigate('UserSettings')}
        {...props}
      />
    </PaddedView>
    <GetUserProfile>
      {({ firstName }) => (
        <StyledH2>
          {message}
          {firstName ? ` ${firstName}` : ''}!
        </StyledH2>
      )}
    </GetUserProfile>
  </Container>
);

UserAvatarHeader.propTypes = {
  buttonIcon: PropTypes.string,
  message: PropTypes.string,
  navigation: PropTypes.shape({
    getParam: PropTypes.func,
    navigate: PropTypes.func,
  }).isRequired,
  onPressIcon: PropTypes.func,
  size: PropTypes.string,
};

UserAvatarHeader.defaultProps = {
  buttonIcon: 'settings',
  message: 'Hello',
  size: 'large',
};

export default withNavigation(UserAvatarHeader);
