import { AngieInteractionMode, openAngie } from '@elementor/editor-angie';
import { HelpIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

const HELP_CENTER_ANGIE_PROMPT = `${ __( 'Help me with', 'elementor' ) } `;

const dispatchHelpClickEvent = () => {
	const config = window.elementorCommon?.eventsManager?.config;
	const helpEvent = config?.names?.topBar?.help;

	if ( ! config || ! helpEvent || ! config.locations?.topBar || ! config.secondaryLocations?.help ) {
		return;
	}

	window.elementorCommon?.eventsManager?.dispatchEvent?.( helpEvent, {
		location: config.locations.topBar,
		secondaryLocation: config.secondaryLocations.help,
		trigger: config.triggers?.click,
		element: config.elements?.buttonIcon,
	} );
};

export function useHelpCenterProps() {
	return {
		title: __( 'Help Center', 'elementor' ),
		icon: HelpIcon,
		onClick: ( event: React.MouseEvent ) => {
			event.preventDefault();
			dispatchHelpClickEvent();
			openAngie( {
				prompt: HELP_CENTER_ANGIE_PROMPT,
				mode: AngieInteractionMode.ASK,
			} );
		},
	};
}
