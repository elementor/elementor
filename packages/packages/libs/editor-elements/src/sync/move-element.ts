import { createElement } from './create-element';
import { deleteElement } from './delete-element';
import { getContainer } from './get-container';
import { findModelWithParent, getModel, type V1Collection } from './get-model';
import { type V1Element } from './types';

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

export function moveElement( { elementId, targetContainerId, options = {} }: MoveElementParams ): V1Element {
	const sourceContainer = getContainer( elementId );
	const targetContainer = getContainer( targetContainerId );

	if ( sourceContainer && targetContainer ) {
		return moveElementViaContainers( { elementId, targetContainerId, options } );
	}

	return moveElementViaModels( { elementId, targetContainerId, options } );
}

function moveElementViaContainers( { elementId, targetContainerId, options = {} }: MoveElementParams ): V1Element {
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
		options: { ...options, useHistory: false },
	} );

	const newContainer = createElement( {
		containerId: targetContainerId,
		model: modelToRecreate,
		options: { edit: false, ...options, useHistory: false },
	} );

	return newContainer;
}

function moveElementViaModels( { elementId, targetContainerId, options = {} }: MoveElementParams ): V1Element {
	const sourceResult = findModelWithParent( elementId );
	const targetResult = getModel( targetContainerId );

	if ( ! sourceResult ) {
		throw new Error( `Element with ID "${ elementId }" not found` );
	}

	if ( ! targetResult ) {
		throw new Error( `Target container with ID "${ targetContainerId }" not found` );
	}

	const { model, collection: sourceCollection } = sourceResult;
	const targetCollection = targetResult.model.get( 'elements' ) as V1Collection | undefined;

	if ( ! targetCollection ) {
		throw new Error( `Target container with ID "${ targetContainerId }" has no elements collection` );
	}

	sourceCollection.remove( model );

	const insertAt = options.at;

	targetCollection.add( model, insertAt !== undefined ? { at: insertAt } : {}, true );

	const container = getContainer( elementId );

	if ( container ) {
		return container;
	}

	return {
		id: elementId,
		model,
		settings: model.get( 'settings' ) ?? {},
	} as V1Element;
}
