import * as React from 'react';

import { SlotChildren } from '../../../control-replacements';
import { DisableItemAction } from '../actions/disable-item-action';
import { DuplicateItemAction } from '../actions/duplicate-item-action';
import { RemoveItemAction } from '../actions/remove-item-action';
import { ItemActionSlot } from './item-action-slot';

export const ItemActionsContainer = ( { children }: { children: React.ReactNode } ) => {
	return (
		<SlotChildren whitelist={ [ DuplicateItemAction, DisableItemAction, RemoveItemAction, ItemActionSlot ] } sorted>
			{ children }
		</SlotChildren>
	);
};
