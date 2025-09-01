import { createElement } from './create-element';
import { deleteElement } from './delete-element';
import { getContainer } from './get-container';
import { type V1Element, type V1ElementModelProps } from './types';

type ReplaceElementArgs = {
	currentElement: V1Element;
	newElement: Omit< V1ElementModelProps, 'id' >;
	withHistory?: boolean;
};

export const replaceElement = ( { currentElement, newElement, withHistory = true }: ReplaceElementArgs ) => {
	const parent = getContainer( currentElement.id )?.parent;

	if ( ! parent ) {
		throw new Error( `Parent not found for element ${ currentElement.id }. Cannot replace element.` );
	}

	const elementIndex = parent.children?.findIndex( ( child ) => child.id === currentElement.id );
	if ( elementIndex === undefined || elementIndex === -1 ) {
		throw new Error( `Element ${ currentElement.id } not found in parent container. Cannot replace element.` );
	}

	createElement( {
		containerId: parent.id,
		model: newElement,
		options: { at: elementIndex, useHistory: withHistory },
	} );

	deleteElement( { elementId: currentElement.id, options: { useHistory: withHistory } } );
};
