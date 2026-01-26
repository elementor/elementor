import * as React from 'react';
import { useCallback } from 'react';

import { useInteractionItemContext } from '../contexts/interactions-item-context';
import type { InteractionItemPropValue, InteractionItemValue } from '../types';
import { InteractionDetails } from './interaction-details';

export const InteractionsListItem = ( { index, value }: { index: number; value: InteractionItemPropValue } ) => {
	const context = useInteractionItemContext();

	const handleChange = useCallback(
		( newInteractionValue: InteractionItemValue ) => {
			context?.onInteractionChange( index, newInteractionValue );
		},
		[ context, index ]
	);

	const handlePlayInteraction = useCallback(
		( interactionId: string ) => {
			context?.onPlayInteraction( interactionId );
		},
		[ context ]
	);

	return (
		<InteractionDetails
			key={ index }
			interaction={ value.value }
			onChange={ handleChange }
			onPlayInteraction={ handlePlayInteraction }
		/>
	);
};
