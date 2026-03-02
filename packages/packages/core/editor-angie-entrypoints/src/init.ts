import { injectIntoTop } from '@elementor/editor';

import { AngiePromotionModal } from './components/angie-promotion-modal';

export function init() {
	injectIntoTop( {
		id: 'angie-promotion-modal',
		component: AngiePromotionModal,
	} );
}
