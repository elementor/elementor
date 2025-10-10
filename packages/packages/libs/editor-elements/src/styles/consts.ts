import { commandEndEvent, windowEvent } from '@elementor/editor-v1-adapters';

export const ELEMENT_STYLE_CHANGE_EVENT = 'elementor/editor-v2/editor-elements/style';

export const styleRerenderEvents = [
	commandEndEvent( 'document/elements/create' ),
	commandEndEvent( 'document/elements/duplicate' ),
	commandEndEvent( 'document/elements/import' ),
	commandEndEvent( 'document/elements/paste' ),
	windowEvent( ELEMENT_STYLE_CHANGE_EVENT ),
];
