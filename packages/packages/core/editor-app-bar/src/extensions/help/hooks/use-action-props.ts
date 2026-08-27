import { isAngieAvailable, openAngieInAskMode } from '@elementor/editor-mcp';
import { HelpIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { type ExtendedWindow } from '../../../types';

const HELP_CENTER_URL = 'https://go.elementor.com/editor-top-bar-learn/';

const dispatchHelpClickEvent = () => {
	const extendedWindow = window as unknown as ExtendedWindow;
	const config = extendedWindow?.elementorCommon?.eventsManager?.config;

	if ( config ) {
		extendedWindow.elementorCommon.eventsManager.dispatchEvent( config.names.topBar.help, {
			location: config.locations.topBar,
			secondaryLocation: config.secondaryLocations.help,
			trigger: config.triggers.click,
			element: config.elements.buttonIcon,
		} );
	}
};

export default function useActionProps() {
	const hasAngieActive = isAngieAvailable();

	if ( hasAngieActive ) {
		return {
			title: __( 'Help Center', 'elementor' ),
			icon: HelpIcon,
			onClick: ( event: React.MouseEvent ) => {
				event.preventDefault();
				dispatchHelpClickEvent();
				openAngieInAskMode();
			},
		};
	}

	return {
		title: __( 'Help Center', 'elementor' ),
		href: HELP_CENTER_URL,
		icon: HelpIcon,
		target: '_blank',
		onClick: () => {
			dispatchHelpClickEvent();
		},
	};
}
