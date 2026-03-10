import { useState } from 'react';
import { type ElementID, type ElementInteractions, getElementInteractions } from '@elementor/editor-elements';
import { __privateUseListenTo as useListenTo, windowEvent } from '@elementor/editor-v1-adapters';

import { filterInteractions } from '../utils/filter-interactions';

export const useElementInteractions = ( elementId: ElementID ) => {
	const [ interactions, setInteractions ] = useState< ElementInteractions >( () => {
		const initial = getElementInteractions( elementId );
		const filteredInteractions = filterInteractions(initial?.items ?? []);

		return { version: initial?.version ?? 1, items: filteredInteractions };
	} );

	useListenTo(
		windowEvent( 'elementor/element/update_interactions' ),
		() => {
			const newInteractions = getElementInteractions( elementId );
			const filteredInteractions = filterInteractions(newInteractions?.items ?? []);
			setInteractions( { version: newInteractions?.version ?? 1, items: filteredInteractions } );
		},
		[ elementId ]
	);

	return interactions;
};
