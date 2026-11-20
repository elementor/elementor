import { AngieIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { ANGIE_GUIDE_TOGGLE_EVENT } from '../angie-consts';

export function useActionProps() {
	return {
		title: __( 'Angie', 'elementor' ),
		icon: AngieIcon,
		onClick: () => {
			window.dispatchEvent( new CustomEvent( ANGIE_GUIDE_TOGGLE_EVENT ) );
		},
		selected: false,
		visible: false,
	};
}
