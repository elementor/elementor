import { useState } from 'react';
import { __privateUseListenTo as useListenTo, windowEvent } from '@elementor/editor-v1-adapters';

import { getElementInteractions } from '../sync/get-element-interactions';
import { type ElementID } from '../types';
import { ElementInteractions } from '../sync/types';

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
