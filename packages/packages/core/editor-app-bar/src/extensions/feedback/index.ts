import { MessageLinesIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { mainMenu } from '../../locations';

export const FEEDBACK_TOGGLE_EVENT = 'elementor/open-feedback';

export function init() {
	mainMenu.registerAction( {
		id: 'open-send-feedback',
		group: 'help',
		priority: 20,
		useProps: () => {
			return {
				icon: MessageLinesIcon,
				title: __( 'Send Feedback', 'elementor' ),
				onClick: () => {
					dispatchEvent( new CustomEvent( FEEDBACK_TOGGLE_EVENT ) );
				},
			};
		},
	} );
}
