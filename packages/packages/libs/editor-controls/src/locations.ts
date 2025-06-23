import { type PropValue } from '@elementor/editor-props';
import { createReplaceableLocation } from '@elementor/locations';

// Repeaters
export const { Slot: RepeaterItemIconSlot, inject: injectIntoRepeaterItemIcon } = createReplaceableLocation< {
	value: PropValue;
} >();

export const { Slot: RepeaterItemLabelSlot, inject: injectIntoRepeaterItemLabel } = createReplaceableLocation< {
	value: PropValue;
} >();
