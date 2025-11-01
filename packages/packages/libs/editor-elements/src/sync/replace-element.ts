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

export const replaceElement = ( { currentElement, newElement, withHistory = true }: ReplaceElementArgs ) => {
	const { containerId, index } = getNewElementLocation( currentElement, newElement );

	createElement( {
		containerId,
		model: newElement,
		options: { at: index, useHistory: withHistory },
	} );

	deleteElement( { elementId: currentElement.id, options: { useHistory: withHistory } } );
};

function getNewElementLocation(
	currentElement: V1ElementData,
	newElement: Omit< V1ElementModelProps, 'id' >
): ElementLocation {
	let location: ElementLocation;

	const currentElementContainer = getContainer( currentElement.id );
	if ( ! currentElementContainer ) {
		throw new Error( `Element ${ currentElement.id } not found. Cannot replace element.` );
	}
	const parent = currentElementContainer.parent;
	if ( ! parent ) {
		throw new Error( `Parent not found for element ${ currentElement.id }. Cannot replace element.` );
	}

	const elementIndex = currentElementContainer.view?._index ?? 0;
	if ( elementIndex === undefined || elementIndex === -1 ) {
		throw new Error( `Element ${ currentElement.id } not found in parent container. Cannot replace element.` );
	}

	location = { containerId: parent.id, index: elementIndex };

	// If the element is at document top level and is a widget, wrap it with an empty container
	if ( parent.id === 'document' && newElement.elType === 'widget' ) {
		location = createWrapperForWidget( parent.id, elementIndex );
	}

	return location;
}

function createWrapperForWidget( parentId: string, elementIndex: number ): ElementLocation {
	const container = createElement( {
		containerId: parentId,
		model: { elType: 'container' },
		options: { at: elementIndex, useHistory: false },
	} );

	return { containerId: container.id, index: 0 };
}
