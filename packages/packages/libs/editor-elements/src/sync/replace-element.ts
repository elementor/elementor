import { ElementIndexNotFoundError, ElementNotFoundError, ElementParentNotFoundError } from '../errors';
import { createElement } from './create-element';
import { deleteElement } from './delete-element';
import { getContainer } from './get-container';
import { type V1ElementData, type V1ElementModelProps } from './types';

type ElementLocation = {
	containerId: string;
	index: number;
};

type ReplaceElementArgs = {
	currentElement: V1ElementData;
	newElement: Omit< V1ElementModelProps, 'id' >;
	withHistory?: boolean;
};

export const replaceElement = async ( { currentElement, newElement, withHistory = true }: ReplaceElementArgs ) => {
	const { containerId, index } = getNewElementContainer( currentElement, newElement );

	const newElementInstance = createElement( {
		containerId,
		model: newElement,
		options: { at: index, useHistory: withHistory },
	} );

	await deleteElement( { elementId: currentElement.id, options: { useHistory: withHistory } } );

	return newElementInstance;
};

function getNewElementContainer(
	currentElement: V1ElementData,
	newElement: Omit< V1ElementModelProps, 'id' >
): ElementLocation {
	const currentElementContainer = getContainer( currentElement.id );

	if ( ! currentElementContainer ) {
		throw new ElementNotFoundError( { context: { elementId: currentElement.id } } );
	}

	const { parent } = currentElementContainer;

	if ( ! parent ) {
		throw new ElementParentNotFoundError( { context: { elementId: currentElement.id } } );
	}

	const elementIndex = currentElementContainer.view?._index ?? 0;

	if ( elementIndex === -1 ) {
		throw new ElementIndexNotFoundError( { context: { elementId: currentElement.id } } );
	}

	let container = { containerId: parent.id, index: elementIndex };

	// If the element is at document top level and is a widget, wrap it with an empty container
	if ( parent.id === 'document' && newElement.elType === 'widget' ) {
		container = createWrapperForWidget( parent.id, elementIndex );
	}

	return container;
}

const DEFAULT_CONTAINER_TYPE = 'e-flexbox';

function createWrapperForWidget( parentId: string, elementIndex: number ): ElementLocation {
	const container = createElement( {
		containerId: parentId,
		model: { elType: DEFAULT_CONTAINER_TYPE },
		options: { at: elementIndex, useHistory: false },
	} );

	return { containerId: container.id, index: 0 };
}
