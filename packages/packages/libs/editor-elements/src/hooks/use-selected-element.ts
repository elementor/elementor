import { __privateUseListenTo as useListenTo, commandEndEvent } from '@elementor/editor-v1-adapters';

import { getSelectedElement } from '../sync/get-selected-elements';

export function useSelectedElement() {
	return useListenTo(
		[
			commandEndEvent( 'document/elements/select' ),
			commandEndEvent( 'document/elements/deselect' ),
			commandEndEvent( 'document/elements/select-all' ),
			commandEndEvent( 'document/elements/deselect-all' ),
		],
		getSelectedElement
	);
}
