import { commandEndEvent, windowEvent } from '@elementor/editor-v1-adapters';

export const ELEMENT_SETTINGS_VARIANTS_CHANGE_EVENT = 'elementor/editor-v2/editor-elements/settings-variants';

export const settingsVariantsRerenderEvents = [
	commandEndEvent( 'document/elements/create' ),
	commandEndEvent( 'document/elements/duplicate' ),
	commandEndEvent( 'document/elements/import' ),
	commandEndEvent( 'document/elements/paste' ),
	commandEndEvent( 'document/elements/set-settings' ),
	windowEvent( ELEMENT_SETTINGS_VARIANTS_CHANGE_EVENT ),
];
