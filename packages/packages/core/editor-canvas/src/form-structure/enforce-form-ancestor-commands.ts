import { type NotificationData, notify } from '@elementor/editor-notifications';
import { blockCommand } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import {
	type CreateArgs,
	FORM_FIELD_ELEMENT_TYPES,
	getArgsElementType,
	getElementTypeFromModel,
	hasClipboardElementTypes,
	hasElementTypes,
	isWithinForm,
	type MoveArgs,
	type PasteArgs,
	type StorageContent,
} from './utils';

const FORM_FIELDS_OUTSIDE_ALERT: NotificationData = {
	type: 'default',
	message: __( 'Form elements must be placed inside a form.', 'elementor' ),
	id: 'form-fields-outside-form-blocked',
};

export function initFormAncestorEnforcement() {
	blockCommand( {
		command: 'document/elements/create',
		condition: blockFormFieldCreate,
	} );

	blockCommand( {
		command: 'document/elements/move',
		condition: blockFormFieldMove,
	} );

	blockCommand( {
		command: 'document/elements/paste',
		condition: blockFormFieldPaste,
	} );
}

function isContainerForFormField( args: CreateArgs ): boolean {
	const wrapperForModel = args?.options?.wrapperForModel;

	if ( wrapperForModel ) {
		const elementType = getElementTypeFromModel( wrapperForModel );

		if ( ! elementType || ( elementType && FORM_FIELD_ELEMENT_TYPES.has( elementType ) ) ) {
			return true;
		}
	}

	return false;
}

function blockFormFieldCreate( args: CreateArgs ): boolean {
	if ( isContainerForFormField( args ) ) {
		handleBlockedFormField();

		return true;
	}

	const elementType = getArgsElementType( args );

	if ( ! elementType || ! FORM_FIELD_ELEMENT_TYPES.has( elementType ) ) {
		return false;
	}

	if ( ! isWithinForm( args.container ) || isContainerForFormField( args ) ) {
		handleBlockedFormField();

		return true;
	}

	return false;
}

function blockFormFieldMove( args: MoveArgs ): boolean {
	const { containers = [ args.container ], target } = args;

	const hasFormFieldElement = containers.some( ( container ) =>
		container ? hasElementTypes( container, FORM_FIELD_ELEMENT_TYPES ) : false
	);

	if ( hasFormFieldElement && ! isWithinForm( target ) ) {
		handleBlockedFormField();

		return true;
	}

	return false;
}

function blockFormFieldPaste( args: PasteArgs ): boolean {
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

	const hasFormFieldElement = hasClipboardElementTypes( data.clipboard.elements, FORM_FIELD_ELEMENT_TYPES );

	if ( hasFormFieldElement && ! isWithinForm( args.container ) ) {
		handleBlockedFormField();

		return true;
	}

	return false;
}

function handleBlockedFormField(): void {
	notify( FORM_FIELDS_OUTSIDE_ALERT );
}
