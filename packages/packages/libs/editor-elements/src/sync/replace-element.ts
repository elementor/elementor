import { ElementIndexNotFoundError, ElementNotFoundError, ElementParentNotFoundError } from '../errors';
import { createElement } from './create-element';
import { deleteElement } from './delete-element';
import { getContainer } from './get-container';
import { type V1Element, type V1ElementData, type V1ElementModelProps } from './types';

type ElementLocation = {
	container: V1Element;
	index: number;
};

type ReplaceElementArgs = {
	currentElement: V1ElementData;
	newElement: Omit< V1ElementModelProps, 'id' >;
	withHistory?: boolean;
};

export const replaceElement = async ( { currentElement, newElement, withHistory = true }: ReplaceElementArgs ) => {
	const currentElementContainer = getContainer( currentElement.id );

	if ( ! currentElementContainer ) {
		throw new ElementNotFoundError( { context: { elementId: currentElement.id } } );
	}

	const { container, index } = getNewElementContainer( currentElementContainer, newElement );

	const newElementInstance = createElement( {
		container,
		model: newElement,
		options: { at: index, useHistory: withHistory },
	} );

	await deleteElement( { container: currentElementContainer, options: { useHistory: withHistory } } );

	return newElementInstance;
};

function getNewElementContainer(
	currentElementContainer: V1Element,
	newElement: Omit< V1ElementModelProps, 'id' >
): ElementLocation {
	const { parent } = currentElementContainer;

	if ( ! parent ) {
		throw new ElementParentNotFoundError( { context: { elementId: currentElementContainer.id } } );
	}

	const elementIndex = currentElementContainer.view?._index ?? 0;

	if ( elementIndex === -1 ) {
		throw new ElementIndexNotFoundError( { context: { elementId: currentElementContainer.id } } );
	}

	let location: ElementLocation = { container: parent, index: elementIndex };

	if ( parent.id === 'document' && newElement.elType === 'widget' ) {
		location = createWrapperForWidget( parent, elementIndex );
	}

	return location;
}

const DEFAULT_CONTAINER_TYPE = 'e-flexbox';

function createWrapperForWidget( parent: V1Element, elementIndex: number ): ElementLocation {
	const container = createElement( {
		container: parent,
		model: { elType: DEFAULT_CONTAINER_TYPE },
		options: { at: elementIndex, useHistory: false },
	} );

	return { container, index: 0 };
}
