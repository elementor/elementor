import { mainMenu } from '../../locations';
import useConnectLinkConfig from './hooks/use-connect-link-config';

export function init() {
	mainMenu.registerLink( {
		id: 'app-bar-connect',
		group: 'exits',
		priority: 10,
		useProps: useConnectLinkConfig,
	} );
}
