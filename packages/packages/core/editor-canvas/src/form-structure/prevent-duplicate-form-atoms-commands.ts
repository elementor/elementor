import { getAllDescendants, type V1Element } from '@elementor/editor-elements';
import { type NotificationData, notify } from '@elementor/editor-notifications';
import { blockCommand, type HookOptions, registerDataHook } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import {
	type CreateArgs,
	FORM_HONEYPOT_ELEMENT_TYPE,
	FORM_RECAPTCHA_SCORE_ELEMENT_TYPE,
	getElementType,
	getFormContainer,
	hasElementType,
	hasModelElementType,
	type MoveArgs,
} from './utils';

const MOVE_COMMAND = 'document/elements/move';

const SINGLE_INSTANCE_FORM_ATOM_ALERTS: Record< string, NotificationData > = {
	[ FORM_HONEYPOT_ELEMENT_TYPE ]: {
		type: 'default',
		message: __( 'Only one Honeypot can be added per form.', 'elementor' ),
		id: 'duplicate-honeypot-blocked',
	},
	[ FORM_RECAPTCHA_SCORE_ELEMENT_TYPE ]: {
		type: 'default',
		message: __( 'Only one Score-based reCAPTCHA can be added per form.', 'elementor' ),
		id: 'duplicate-recaptcha-score-blocked',
	},
};

const SINGLE_INSTANCE_FORM_ATOM_TYPES = Object.keys( SINGLE_INSTANCE_FORM_ATOM_ALERTS );

export function initDuplicateFormAtomsPrevention() {
	registerDataHook( 'dependency', 'document/elements/create', ( args: CreateArgs, options?: HookOptions ) => {
		return ! blockDuplicateCreate( args, options );
	} );

	blockCommand( {
		command: 'document/elements/move',
		condition: blockDuplicateMove,
	} );
}

function blockDuplicateCreate( args: CreateArgs, options?: HookOptions ): boolean {
	// Move re-creates the moved element at the target, so it is handled by the move condition.
	if ( options?.commandsCurrentTrace?.includes( MOVE_COMMAND ) ) {
		return false;
	}

	const containers = args.containers ?? [ args.container ];

	const blockedType = SINGLE_INSTANCE_FORM_ATOM_TYPES.find(
		( type ) =>
			hasModelElementType( args.model, type ) &&
			containers.some( ( container ) => formHasElementType( getFormContainer( container ), type ) )
	);

	if ( ! blockedType ) {
		return false;
	}

	notify( SINGLE_INSTANCE_FORM_ATOM_ALERTS[ blockedType ] );

	return true;
}

function blockDuplicateMove( args: MoveArgs ): boolean {
	const { containers = [ args.container ], target } = args;
	const movedContainers = containers.filter( ( container ): container is V1Element => !! container );
	const movedElements = new Set( movedContainers.flatMap( ( container ) => getAllDescendants( container ) ) );
	const targetForm = getFormContainer( target );

	const blockedType = SINGLE_INSTANCE_FORM_ATOM_TYPES.find(
		( type ) =>
			movedContainers.some( ( container ) => hasElementType( container, type ) ) &&
			formHasElementType( targetForm, type, movedElements )
	);

	if ( ! blockedType ) {
		return false;
	}

	notify( SINGLE_INSTANCE_FORM_ATOM_ALERTS[ blockedType ] );

	return true;
}

function formHasElementType( form: V1Element | undefined, type: string, excluded: Set< V1Element > = new Set() ) {
	if ( ! form ) {
		return false;
	}

	return getAllDescendants( form ).some(
		( element ) => ! excluded.has( element ) && getElementType( element ) === type
	);
}
