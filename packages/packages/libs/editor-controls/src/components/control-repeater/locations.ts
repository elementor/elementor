import { type PropValue } from '@elementor/editor-props';
import { createLocation, createReplaceableLocation } from '@elementor/locations';

// Repeaters
export const { Slot: RepeaterItemIconSlot, inject: injectIntoRepeaterItemIcon } = createReplaceableLocation< {
	value: PropValue;
} >();

export const { Slot: RepeaterItemLabelSlot, inject: injectIntoRepeaterItemLabel } = createReplaceableLocation< {
	value: PropValue;
} >();

export const { Slot: RepeaterItemActionsSlot, inject: injectIntoRepeaterItemActions } = createLocation< {
	index: number;
} >();
