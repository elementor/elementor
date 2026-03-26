import { injectIntoLogic } from '@elementor/editor';

import StarterOverlay from './components/starter-overlay';

export function init() {
	injectIntoLogic( {
		id: 'starter-overlay',
		component: StarterOverlay,
	} );
}
