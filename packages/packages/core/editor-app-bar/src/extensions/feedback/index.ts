import { MessageLinesIcon } from '@elementor/icons';

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
				title: 'Send Feedback',
				onClick: () => {
					dispatchEvent( new CustomEvent( FEEDBACK_TOGGLE_EVENT ) );
				},
			};
		},
	} );
}
