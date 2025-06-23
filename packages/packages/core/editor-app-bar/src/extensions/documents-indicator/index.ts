import { injectIntoPageIndication } from '../../locations';
import SettingsButton from './components/settings-button';

export function init() {
	injectIntoPageIndication( {
		id: 'document-settings-button',
		component: SettingsButton,
		options: {
			priority: 20, // After document indicator.
		},
	} );
}
