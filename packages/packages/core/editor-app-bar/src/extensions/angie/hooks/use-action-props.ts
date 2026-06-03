import { useEffect } from 'react';
import { isAngieAvailable } from '@elementor/editor-mcp';
import { trackEvent } from '@elementor/events';
import { AngieIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { AI_WIDGET_CTA_VIEWED_EVENT, ANGIE_GUIDE_TOGGLE_EVENT } from '../angie-consts';

export function useActionProps() {
	const hasAngieInstalled = isAngieAvailable();
	const visible = ! hasAngieInstalled;

	useEffect( () => {
		if ( ! visible ) {
			return;
		}

		trackEvent( {
			eventName: AI_WIDGET_CTA_VIEWED_EVENT,
			entry_point: 'top_bar_icon',
			has_angie_installed: false,
		} );
	}, [ visible ] );

	return {
		title: __( 'Angie - TEST', 'elementor' ),
		icon: AngieIcon,
		onClick: () => {
			window.dispatchEvent( new CustomEvent( ANGIE_GUIDE_TOGGLE_EVENT ) );
		},
		selected: false,
		visible,
	};
}
