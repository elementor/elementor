import { useState } from 'react';
import { __privateUseListenTo as useListenTo, windowEvent } from '@elementor/editor-v1-adapters';

import { getElementInteractions } from '../sync/get-element-interactions';
import { type ElementID } from '../types';

export const useElementInteractions = ( elementId: ElementID ) => {
	const [ interactions, setInteractions ] = useState( () => {
		const initial = getElementInteractions( elementId );

		return initial;
	} );

	useListenTo(
		windowEvent( 'elementor/element/update_interactions' ),
		() => {
			const newInteractions = getElementInteractions( elementId );
			setInteractions( newInteractions );
		},
		[ elementId ]
	);

	return interactions;
};
