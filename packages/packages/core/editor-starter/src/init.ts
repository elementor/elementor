import { injectIntoTop } from '@elementor/editor';

import { WelcomeScreen } from './components/welcome-screen';

export function init() {
	injectIntoTop( {
		id: 'welcome-screen',
		component: WelcomeScreen,
	} );
}
