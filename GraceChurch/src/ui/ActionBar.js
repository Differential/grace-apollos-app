import { ActionBar, ActionBarItem } from "@apollosproject/ui-kit";
import { useNavigation } from "@react-navigation/native";
import { RockAuthedWebBrowser } from "@apollosproject/ui-connected";

const Toolbar = () => {
  const navigation = useNavigation();
  return (
    <RockAuthedWebBrowser>
      {(openUrl) => (
        <ActionBar>
          <ActionBarItem
            onPress={() => Linking.openURL("https://trygrace.org/give")}
            icon="like"
            label="Give"
          />
          <ActionBarItem
            onPress={() => openUrl("mailto:info@trygrace.org")}
            icon="information"
            label="Contact"
          />
        </ActionBar>
      )}
    </RockAuthedWebBrowser>
  );
};

export default Toolbar;
