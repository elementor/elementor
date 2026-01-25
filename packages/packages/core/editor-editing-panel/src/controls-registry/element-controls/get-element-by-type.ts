import { getContainer } from '@elementor/editor-elements';

export const findElementByType = ( elementId: string, type: string ) => {
	const currentElement = getContainer( elementId );

	if ( ! currentElement ) {
		return null;
	}

	if ( currentElement.model.get( 'elType' ) === type ) {
		return currentElement;
	}

	return currentElement.children?.findRecursive?.( ( child ) => child.model.get( 'elType' ) === type ) ?? null;
};

export const getElementByType = ( elementId: string, type: string ) => {
	const element = findElementByType( elementId, type );

	if ( ! element ) {
		throw new Error( `Child element ${ type } not found` );
	}

	return element;
};
