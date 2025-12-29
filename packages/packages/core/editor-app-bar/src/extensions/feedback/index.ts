import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { MessageLinesIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { mainMenu } from '../../locations';
import { EXPERIMENT_NAME, FEEDBACK_TOGGLE_EVENT } from './feedback-consts';



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
