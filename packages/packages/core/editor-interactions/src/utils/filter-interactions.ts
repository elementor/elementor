import { type InteractionItemPropValue } from '@elementor/editor-elements';

import { isSupportedInteractionItem } from './is-supported-interaction-item';

export const filterInteractions = ( interactions: InteractionItemPropValue[] ) => {
	return interactions.filter( ( interaction ) => {
		return isSupportedInteractionItem( interaction );
	} );
};
