import { getContainer } from '@elementor/editor-elements';

export const getElementByType = ( elementId: string, type: string ) => {
	const currentElement = getContainer( elementId );

	if ( ! currentElement ) {
		throw new Error( `Current element not found, elementId: ${ elementId }` );
	}

	if ( currentElement.model.get( 'elType' ) === type ) {
		return currentElement;
	}

	const element = currentElement.children?.findRecursive?.( ( child ) => child.model.get( 'elType' ) === type );

	if ( ! element ) {
		throw new Error( `Child element ${ type } not found` );
	}

	return element;
};
