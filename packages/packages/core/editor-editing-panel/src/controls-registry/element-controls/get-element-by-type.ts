import { getContainer } from '@elementor/editor-elements';

export const getElementByType = ( elementId: string, type: string ) => {
	const currentElement = getContainer( elementId );

	if ( ! currentElement ) {
		return null;
	}

	if ( currentElement.model.get( 'elType' ) === type ) {
		return currentElement;
	}

	return currentElement.children?.findRecursive?.( ( child ) => child.model.get( 'elType' ) === type ) ?? null;
};
