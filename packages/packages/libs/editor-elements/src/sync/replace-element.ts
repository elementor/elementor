import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';

import { getContainer } from './get-container';
import { type V1Element, type V1ElementModelProps } from './types';

export const replaceElement = ( currentElement: V1Element, newElement: Omit< V1ElementModelProps, 'id' > ) => {
	const parent = getContainer( currentElement.id )?.parent;

	if ( ! parent ) {
		throw new Error( `Parent not found for element ${ currentElement.id }. Cannot replace element.` );
	}

	const elementIndex = parent.children?.findIndex( ( child ) => child.id === currentElement.id );
	if ( elementIndex === undefined || elementIndex === -1 ) {
		throw new Error( `Element ${ currentElement.id } not found in parent container. Cannot replace element.` );
	}

	addElement( parent, newElement, { at: elementIndex } );
	deleteElement( currentElement );
};

export const addElement = (
	parent: V1Element | undefined,
	element: Omit< V1ElementModelProps, 'id' >,
	options?: { at?: number }
) => {
	runCommand( 'document/elements/create', {
		container: parent,
		model: element,
		options,
	} );
};

export const deleteElement = ( element: V1Element ) => {
	runCommand( 'document/elements/delete', {
		container: element,
	} );
};
