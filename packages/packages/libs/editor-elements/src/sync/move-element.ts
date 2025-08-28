import { createElement } from './create-element';
import { deleteElement } from './delete-element';
import { getContainer } from './get-container';

type Options = {
	useHistory?: boolean;
	at?: number;
	edit?: boolean;
};

export type MoveElementParams = {
	elementId: string;
	targetContainerId: string;
	options?: Options;
};

export function moveElement( { elementId, targetContainerId, options = {} }: MoveElementParams ) {
	const container = getContainer( elementId );
	const target = getContainer( targetContainerId );

	if ( ! container ) {
		throw new Error( `Element with ID "${ elementId }" not found` );
	}

	if ( ! target ) {
		throw new Error( `Target container with ID "${ targetContainerId }" not found` );
	}

	const modelToRecreate = container.model.toJSON();

	deleteElement( {
		elementId,
		// prevent inner history from being created
		options: { ...options, useHistory: false },
	} );

	const newContainer = createElement( {
		containerId: targetContainerId,
		model: modelToRecreate,
		// prevent inner history from being created
		options: { edit: false, ...options, useHistory: false },
	} );

	return newContainer;
}
