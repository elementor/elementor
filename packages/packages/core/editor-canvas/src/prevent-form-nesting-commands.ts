import { getAllDescendants, type V1Element } from '@elementor/editor-elements';
import { type NotificationData, notify } from '@elementor/editor-notifications';
import { blockCommand } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

type CreateArgs = {
	container?: V1Element;
	model?: {
		elType?: string;
		widgetType?: string;
	};
};

type MoveArgs = {
	containers?: V1Element[];
	container?: V1Element;
	target?: V1Element;
};

type PasteArgs = {
	container?: V1Element;
	storageType?: string;
};

type ClipboardElement = {
	elType?: string;
	widgetType?: string;
	elements?: ClipboardElement[];
};

type StorageContent = {
	clipboard?: {
		elements?: ClipboardElement[];
	};
};

const FORM_ELEMENT_TYPE = 'e-form';
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
	const elementType = args.model?.widgetType || args.model?.elType;

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

function hasElementType( element: V1Element, type: string ): boolean {
	return getAllDescendants( element ).some( ( item ) => getElementType( item ) === type );
}


function hasClipboardElementType( elements: ClipboardElement[], type: string ): boolean {
	return elements.some( ( element ) => {
		const elementType = element.widgetType || element.elType;
		if ( elementType === type ) {
			return true;
		}

		return element.elements ? hasClipboardElementType( element.elements, type ) : false;
	} );
}


function getElementType( element?: V1Element ): string | undefined {
	return element?.model.get( 'widgetType' ) || element?.model.get( 'elType' );
}

function isWithinForm( element?: V1Element ): boolean {
	return !! getFormAncestor( element );
}

function getFormAncestor( element?: V1Element ): V1Element | null {
	let current = element;

	while ( current ) {
		if ( getElementType( current ) === FORM_ELEMENT_TYPE ) {
			return current;
		}
		current = current.parent;
	}

	return null;
}
