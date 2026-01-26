import { type NotificationData, notify } from '@elementor/editor-notifications';
import { blockCommand } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import {
	FORM_ELEMENT_TYPE,
	type CreateArgs,
	type MoveArgs,
	type PasteArgs,
	type StorageContent,
	getArgsElementType,
	hasClipboardElementType,
	hasElementType,
	isWithinForm,
} from './utils';

const FORM_NESTING_ALERT: NotificationData = {
	type: 'default',
	message: __( "Forms can't be nested. Create separate forms instead.", 'elementor' ),
	id: 'form-nesting-blocked',
};

export function initFormNestingPrevention() {
	blockCommand( {
		command: 'document/elements/create',
		condition: blockFormCreate,
	} );

	blockCommand( {
		command: 'document/elements/move',
		condition: blockFormMove,
	} );

	blockCommand( {
		command: 'document/elements/paste',
		condition: blockFormPaste,
	} );
}

function blockFormCreate( args: CreateArgs ): boolean {
	const elementType = getArgsElementType( args );

	if ( ! elementType ) {
		return false;
	}

	if ( elementType === FORM_ELEMENT_TYPE && isWithinForm( args.container ) ) {
		notify( FORM_NESTING_ALERT );
		return true;
	}

	return false;
}

function blockFormMove( args: MoveArgs ): boolean {
	const { containers = [ args.container ], target } = args;

	const hasFormElement = containers.some( ( container ) =>
		container ? hasElementType( container, FORM_ELEMENT_TYPE ) : false
	);

	if ( hasFormElement && isWithinForm( target ) ) {
		notify( FORM_NESTING_ALERT );
		return true;
	}

	return false;
}

function blockFormPaste( args: PasteArgs ): boolean {
	const { storageType } = args;

	if ( storageType !== 'localstorage' ) {
		return false;
	}

	const data = (
		window as { elementorCommon?: { storage?: { get: () => StorageContent } } }
	)?.elementorCommon?.storage?.get();

	if ( ! data?.clipboard?.elements ) {
		return false;
	}

	const hasFormElement = hasClipboardElementType( data.clipboard.elements, FORM_ELEMENT_TYPE );

	if ( hasFormElement && isWithinForm( args.container ) ) {
		notify( FORM_NESTING_ALERT );
		return true;
	}

	return false;
}
