import { getAllDescendants, type V1Element } from '@elementor/editor-elements';

type Model = {
	elType?: string;
	widgetType?: string;
};

export type CreateArgs = {
	container?: V1Element;
	containers?: V1Element[];
	model?: Model;
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
export const FORM_FIELD_ELEMENT_TYPES = new Set( [
	'e-form-input',
	'e-form-textarea',
	'e-form-label',
	'e-form-checkbox',
	'e-form-submit-button',
	'e-form-select',
	'e-form-radio-button',
	'e-form-file-upload',
	'e-form-date-picker',
	'e-form-time-picker',
] );

export function getArgsElementType( args: CreateArgs ): string | undefined {
	return args.model?.widgetType || args.model?.elType;
}

export function getElementType( element?: V1Element ): string | undefined {
	return element?.model.get( 'widgetType' ) || element?.model.get( 'elType' );
}

export function getClipboardElementType( element?: ClipboardElement ): string | undefined {
	return element?.widgetType || element?.elType;
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
		const elementType = getClipboardElementType( element );

		if ( elementType === type ) {
			return true;
		}

		return element.elements ? hasClipboardElementType( element.elements, type ) : false;
	} );
}

export function hasClipboardElementTypes( elements: ClipboardElement[], types: Set< string > ): boolean {
	return elements.some( ( element ) => {
		const elementType = getClipboardElementType( element );

		if ( elementType && types.has( elementType ) ) {
			return true;
		}

		return element.elements ? hasClipboardElementTypes( element.elements, types ) : false;
	} );
}

export function movedContainersIncludeAtomicFormRoot( containers: ( V1Element | undefined )[] ): boolean {
	return containers.some( ( container ) => getElementType( container ) === FORM_ELEMENT_TYPE );
}

export function clipboardRootsAreAtomicForms( elements: ClipboardElement[] ): boolean {
	if ( ! elements.length ) {
		return false;
	}

	return elements.every( ( el ) => getClipboardElementType( el ) === FORM_ELEMENT_TYPE );
}

export function hasFormAncestor(node: Element): boolean {
	let parent = node.parentElement;
	while (parent) {
	  if (parent.tagName === FORM_ELEMENT_TYPE) return true;
	  parent = parent.parentElement;
	}
	return false;
  }

  export function collectFormAncestorErrors(xml: Document): string[] {
	const errors: string[] = [];
	for (const node of xml.querySelectorAll('*')) {
	  if (!FORM_FIELD_ELEMENT_TYPES.has(node.tagName.toLowerCase())) continue;
	  if (hasFormAncestor(node)) continue;
	  const id = node.getAttribute('configuration-id');
	  errors.push(
		`<${node.tagName}${id ? ` configuration-id="${id}"` : ''}> must be nested inside <e-form> (any ancestor depth is allowed).`
	  );
	}
	return errors;
  }

  export function collectSubmitButtonErrors(xml: Document): string[] {
	const errors: string[] = [];
	for (const form of xml.querySelectorAll('e-form')) {
	  const submitButtons = form.querySelectorAll('e-form-submit-button');
	  if (submitButtons.length === 0) {
		errors.push(`<e-form> has no <e-form-submit-button>.`);
	  } else if (submitButtons.length > 1) {
		errors.push(`<e-form> has ${submitButtons.length} submit buttons — only 1 is allowed.`);
	  }
	}
	return errors;
  }

export function collectEmptyMessageErrors(xml: Document): string[] {
	const errors: string[] = [];
	for (const node of xml.querySelectorAll('e-form-success-message, e-form-error-message')) {
	  if (node.children.length === 0) {
		errors.push(`<${node.tagName}> must have at least one child element (e.g. <e-atomic-paragraph>).`);
	  }
	}
	return errors;
  }
  