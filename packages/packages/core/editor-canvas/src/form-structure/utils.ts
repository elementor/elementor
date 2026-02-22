import { getAllDescendants, type V1Element } from '@elementor/editor-elements';

export type CreateArgs = {
	container?: V1Element;
	model?: {
		elType?: string;
		widgetType?: string;
	};
};

export type MoveArgs = {
	containers?: V1Element[];
	container?: V1Element;
	target?: V1Element;
};

export type PasteArgs = {
	container?: V1Element;
	storageType?: string;
};

export type ClipboardElement = {
	elType?: string;
	widgetType?: string;
	elements?: ClipboardElement[];
};

export type StorageContent = {
	clipboard?: {
		elements?: ClipboardElement[];
	};
};

export const FORM_ELEMENT_TYPE = 'e-form';
export const FORM_FIELD_ELEMENT_TYPES = new Set( [ 'e-form-input', 'e-form-textarea', 'e-form-label', 'e-form-checkbox', 'e-form-submit-button' ] );

export function getArgsElementType( args: CreateArgs ): string | undefined {
	return args.model?.widgetType || args.model?.elType;
}

export function getElementType( element?: V1Element ): string | undefined {
	return element?.model.get( 'widgetType' ) || element?.model.get( 'elType' );
}

export function isElementWithinFormSelector( element?: V1Element ): boolean {
	return !! element?.view?.el?.closest( 'form,[data-element_type="e-form"]' );
}

export function isWithinForm( element?: V1Element ): boolean {
	return isElementWithinFormSelector( element );
}

export function hasElementType( element: V1Element, type: string ): boolean {
	return getAllDescendants( element ).some( ( item ) => getElementType( item ) === type );
}

export function hasElementTypes( element: V1Element, types: Set< string > ): boolean {
	return getAllDescendants( element ).some( ( item ) => {
		const itemType = getElementType( item );

		return itemType ? types.has( itemType ) : false;
	} );
}

export function hasClipboardElementType( elements: ClipboardElement[], type: string ): boolean {
	return elements.some( ( element ) => {
		const elementType = element.widgetType || element.elType;

		if ( elementType === type ) {
			return true;
		}

		return element.elements ? hasClipboardElementType( element.elements, type ) : false;
	} );
}

export function hasClipboardElementTypes( elements: ClipboardElement[], types: Set< string > ): boolean {
	return elements.some( ( element ) => {
		const elementType = element.widgetType || element.elType;

		if ( elementType && types.has( elementType ) ) {
			return true;
		}

		return element.elements ? hasClipboardElementTypes( element.elements, types ) : false;
	} );
}
