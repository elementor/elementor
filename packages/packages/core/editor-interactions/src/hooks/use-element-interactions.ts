import { useState } from 'react';
import { type ElementID, type ElementInteractions, getElementInteractions } from '@elementor/editor-elements';
import { __privateUseListenTo as useListenTo, windowEvent } from '@elementor/editor-v1-adapters';

export const useElementInteractions = ( elementId: ElementID ) => {
	const [ interactions, setInteractions ] = useState< ElementInteractions >( () => {
		const initial = getElementInteractions( elementId );

		return initial ?? { version: 1, items: [] };
	} );

	useListenTo(
		windowEvent( 'elementor/element/update_interactions' ),
		() => {
			const newInteractions = getElementInteractions( elementId );
			setInteractions( newInteractions ?? { version: 1, items: [] } );
		},
		[ elementId ]
	);

	return interactions;
};
