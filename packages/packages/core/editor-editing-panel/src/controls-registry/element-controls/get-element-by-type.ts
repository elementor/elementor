import { findElementByType } from './find-element-by-type';

export { findElementByType };

export const getElementByType = ( elementId: string, type: string ) => {
	const element = findElementByType( elementId, type );

	if ( ! element ) {
		throw new Error( `Child element ${ type } not found` );
	}

	return element;
};
