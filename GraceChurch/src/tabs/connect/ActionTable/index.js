import React from 'react';
import { View } from 'react-native';

import {
  TableView,
  Cell,
  CellIcon,
  CellText,
  Divider,
  Touchable,
  styled,
  PaddedView,
  H4,
} from '@apollosproject/ui-kit';
import { RockAuthedWebBrowser } from '@apollosproject/ui-connected';
import NavigationActions from '../../../NavigationService';

const RowHeader = styled(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: theme.sizing.baseUnit,
}))(PaddedView);

const Name = styled({
  flexGrow: 1,
})(View);

const StyledH4 = styled({
  textTransform: 'uppercase',
})(H4);

const ActionTable = () => (
  <RockAuthedWebBrowser>
    {(openUrl) => (
      <View>
        <RowHeader>
          <Name>
            <StyledH4>{'Connect'}</StyledH4>
          </Name>
        </RowHeader>
        <TableView>
          <Touchable
            onPress={() =>
              openUrl('mailto:info@trygrace.org', { externalBrowser: true })
            }
          >
            <Cell>
              <CellText>Contact Us</CellText>
              <CellIcon name="arrow-next" />
            </Cell>
          </Touchable>
          <Divider />
          <Touchable onPress={() => openUrl('https://trygrace.org/prayer')}>
            <Cell>
              <CellText>I need prayer</CellText>
              <CellIcon name="arrow-next" />
            </Cell>
          </Touchable>
          <Divider />
          <Touchable onPress={() => openUrl('https://trygrace.org/premarital')}>
            <Cell>
              <CellText>Pre-marital counseling</CellText>
              <CellIcon name="arrow-next" />
            </Cell>
          </Touchable>
          <Divider />
          <Touchable
            onPress={() => openUrl('https://trygrace.org/babydedication')}
          >
            <Cell>
              <CellText>Baby dedications</CellText>
              <CellIcon name="arrow-next" />
            </Cell>
          </Touchable>
          <Divider />
          <Touchable onPress={() => openUrl('https://trygrace.org/arlington')}>
            <Cell>
              <CellText>Grace Arlington</CellText>
              <CellIcon name="arrow-next" />
            </Cell>
          </Touchable>
          <Divider />
          <Touchable
            onPress={() => openUrl('https://trygrace.org/westfallschurch')}
          >
            <Cell>
              <CellText>West Falls</CellText>
              <CellIcon name="arrow-next" />
            </Cell>
          </Touchable>
          <Divider />
          <Touchable onPress={() => openUrl('mailto:info@trygrace.org')}>
            <Cell>
              <CellText>Report an issue</CellText>
              <CellIcon name="arrow-next" />
            </Cell>
          </Touchable>
        </TableView>
      </View>
    )}
  </RockAuthedWebBrowser>
);

const StyledActionTable = styled(({ theme }) => ({
  paddingBottom: theme.sizing.baseUnit * 100,
}))(ActionTable);

export default StyledActionTable;
