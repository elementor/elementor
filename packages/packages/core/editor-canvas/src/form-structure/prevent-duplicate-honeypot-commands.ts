import { getAllDescendants, type V1Element } from '@elementor/editor-elements';
import { type NotificationData, notify } from '@elementor/editor-notifications';
import { blockCommand, type HookOptions, registerDataHook } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import {
	type CreateArgs,
	FORM_HONEYPOT_ELEMENT_TYPE,
	getElementType,
	getFormContainer,
	hasElementType,
	hasModelElementType,
	type MoveArgs,
} from './utils';

const MOVE_COMMAND = 'document/elements/move';

const DUPLICATE_HONEYPOT_ALERT: NotificationData = {
	type: 'default',
	message: __( 'Only one Honeypot can be added per form.', 'elementor' ),
	id: 'duplicate-honeypot-blocked',
};

export function initDuplicateHoneypotPrevention() {
	registerDataHook( 'dependency', 'document/elements/create', ( args: CreateArgs, options?: HookOptions ) => {
		return ! blockHoneypotCreate( args, options );
	} );

	blockCommand( {
		command: 'document/elements/move',
		condition: blockHoneypotMove,
	} );
}

function blockHoneypotCreate( args: CreateArgs, options?: HookOptions ): boolean {
	// Move re-creates the moved element at the target, so it is handled by the move condition.
	if ( options?.commandsCurrentTrace?.includes( MOVE_COMMAND ) ) {
		return false;
	}

	if ( ! hasModelElementType( args.model, FORM_HONEYPOT_ELEMENT_TYPE ) ) {
		return false;
	}

	const containers = args.containers ?? [ args.container ];

	if ( containers.some( ( container ) => formHasHoneypot( getFormContainer( container ) ) ) ) {
		handleBlockedHoneypot();

		return true;
	}

	return false;
}

function blockHoneypotMove( args: MoveArgs ): boolean {
	const { containers = [ args.container ], target } = args;
	const movedContainers = containers.filter( ( container ): container is V1Element => !! container );

	if ( ! movedContainers.some( ( container ) => hasElementType( container, FORM_HONEYPOT_ELEMENT_TYPE ) ) ) {
		return false;
	}

	const movedElements = new Set( movedContainers.flatMap( ( container ) => getAllDescendants( container ) ) );

	if ( formHasHoneypot( getFormContainer( target ), movedElements ) ) {
		handleBlockedHoneypot();

		return true;
	}

	return false;
}

function formHasHoneypot( form?: V1Element, excluded: Set< V1Element > = new Set() ): boolean {
	if ( ! form ) {
		return false;
	}

	return getAllDescendants( form ).some(
		( element ) => ! excluded.has( element ) && getElementType( element ) === FORM_HONEYPOT_ELEMENT_TYPE
	);
}

function handleBlockedHoneypot(): void {
	notify( DUPLICATE_HONEYPOT_ALERT );
}
