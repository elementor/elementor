import { __privateUseListenTo as useListenTo, commandEndEvent } from '@elementor/editor-v1-adapters';

import { getSelectedElements } from '../sync/get-selected-elements';
import { useElementType } from './use-element-type';

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

	const elementType = useElementType( element?.type );

	if ( elements.length !== 1 || ! elementType ) {
		return { element: null, elementType: null };
	}

	return { element, elementType };
}
