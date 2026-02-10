import { createElement } from './create-element';
import { deleteElement } from './delete-element';
import { type V1Element } from './types';

type Options = {
	useHistory?: boolean;
	at?: number;
	edit?: boolean;
};

export type MoveElementParams = {
	element: V1Element;
	targetContainer: V1Element;
	options?: Options;
};

export function moveElement( { element, targetContainer, options = {} }: MoveElementParams ): V1Element {
	const resolvedElement = element.lookup?.();
	const resolvedTarget = targetContainer.lookup?.();

	if ( ! resolvedElement ) {
		throw new Error( `Element not found: ${ element.id }` );
	}

	if ( ! resolvedTarget ) {
		throw new Error( `Target container not found: ${ targetContainer.id }` );
	}

	const modelToRecreate = resolvedElement.model.toJSON();

	deleteElement( {
		container: resolvedElement,
		options: { ...options, useHistory: false },
	} );

	const newContainer = createElement( {
		container: resolvedTarget,
		model: modelToRecreate,
		options: { edit: false, ...options, useHistory: false },
	} );

	return newContainer;
}
