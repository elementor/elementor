import { createElement } from './create-element';
import { getContainer } from './get-container';
import { type V1Element } from './types';

type Options = {
	useHistory?: boolean;
	at?: number;
	clone?: boolean;
};

export type DuplicateElementParams = {
	elementId: string;
	options?: Options;
};

export function duplicateElement( { elementId, options = {} }: DuplicateElementParams ): V1Element {
	const elementToDuplicate = getContainer( elementId );

	if ( ! elementToDuplicate ) {
		throw new Error( `Element with ID "${ elementId }" not found` );
	}

	if ( ! elementToDuplicate.parent ) {
		throw new Error( `Element with ID "${ elementId }" has no parent container` );
	}

	const parentContainer = elementToDuplicate.parent;
	const elementModel = elementToDuplicate.model.toJSON();

	// Get the position after the original element (only when cloning)
	const currentIndex = elementToDuplicate.view?._index ?? 0;
	const insertPosition = options.clone !== false ? currentIndex + 1 : undefined;

	return createElement( {
		containerId: parentContainer.id,
		model: elementModel,
		options: {
			at: insertPosition,
			...options,
		},
	} );
}
