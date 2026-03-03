import { type Element, type ElementType } from '../types';
import { getElementType } from './get-element-type';
import { type ExtendedWindow } from './types';

export function getSelectedElements(): Element[] {
	const extendedWindow = window as unknown as ExtendedWindow;

	const selectedElements = extendedWindow.elementor?.selection?.getElements?.() ?? [];

	return selectedElements.reduce< Element[] >( ( acc, el ) => {
		const type = el.model.get( 'widgetType' ) || el.model.get( 'elType' );

		if ( type ) {
			acc.push( {
				id: el.model.get( 'id' ),
				type,
			} );
		}

		return acc;
	}, [] );
}

type GetSelectedElementTypeResult =
	| {
			element: Element;
			elementType: ElementType;
	  }
	| {
			element: null;
			elementType: null;
	  };

export function getSelectedElement(): GetSelectedElementTypeResult {
	const elements = getSelectedElements();

	const [ element ] = elements;
	const elementType = getElementType( element?.type );

	if ( elements.length !== 1 || ! elementType || ! element ) {
		return { element: null, elementType: null };
	}

	return { element, elementType };
}
