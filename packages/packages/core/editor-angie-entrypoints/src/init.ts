import { injectIntoTop } from '@elementor/editor';

import { AngieModal } from './components/angie-modal';

export function init() {
	injectIntoTop( {
		id: 'angie-promotion-modal',
		component: AngieModal,
	} );
}
