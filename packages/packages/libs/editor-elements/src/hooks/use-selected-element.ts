import { __privateUseListenTo as useListenTo, commandEndEvent } from '@elementor/editor-v1-adapters';

import { getElementType } from '../sync/get-element-type';
import { getSelectedElements } from '../sync/get-selected-elements';

export function useSelectedElement() {
	const elements = useListenTo(
		[
			commandEndEvent( 'document/elements/select' ),
			commandEndEvent( 'document/elements/deselect' ),
			commandEndEvent( 'document/elements/select-all' ),
			commandEndEvent( 'document/elements/deselect-all' ),
		],
		getSelectedElements
	);

	const [ element ] = elements;

	const elementType = getElementType( element?.type );

	if ( elements.length !== 1 || ! elementType ) {
		return { element: null, elementType: null };
	}

	return { element, elementType };
}
