import { injectIntoTop } from '@elementor/editor';

import StarterOverlay from './components/starter-overlay';

export function init() {
	injectIntoTop( {
		id: 'starter-overlay',
		component: StarterOverlay,
	} );
}
