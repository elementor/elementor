import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { MessageLinesIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { EXPERIMENT_NAME } from '../../components/locations/send-feedback-popup-location';
import { mainMenu } from '../../locations';

export const FEEDBACK_TOGGLE_EVENT = 'elementor/open-feedback';

export function init() {
	const isActive = isExperimentActive( EXPERIMENT_NAME );
	if ( ! isActive ) {
		return;
	}
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
