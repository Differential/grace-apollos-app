import './loadConfig';
import { AppRegistry } from 'react-native';

const App = require('./src').default;

AppRegistry.registerComponent('GraceChurch', () => App);
