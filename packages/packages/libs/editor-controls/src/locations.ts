import { type PropValue } from '@elementor/editor-props';
import { createLocation, createReplaceableLocation } from '@elementor/locations';

const headerActions = createLocation< { value: PropValue } >();
const itemActions = createLocation< { index: number } >();

const injectHeaderItems = ( component: React.ComponentType< { value: PropValue } >, actionName: string ) => {
	headerActions.inject( {
		id: 'repeater-header-items-' + actionName,
		component,
		options: { overwrite: true },
	} );
};

const injectItemActions = ( component: React.ComponentType< { index: number } >, actionName: string ) => {
	itemActions.inject( {
		id: 'repeater-items-actions-' + actionName,
		component,
		options: { overwrite: true },
	} );
};

// Repeaters
export const { Slot: RepeaterItemIconSlot, inject: injectIntoRepeaterItemIcon } = createReplaceableLocation< {
	value: PropValue;
} >();

export const { Slot: RepeaterItemLabelSlot, inject: injectIntoRepeaterItemLabel } = createReplaceableLocation< {
	value: PropValue;
} >();

export const RepeaterHeaderActionsSlot = headerActions.Slot;

export const injectIntoRepeaterHeaderActions = injectHeaderItems;

export const RepeaterItemActionsSlot = itemActions.Slot;

export const injectIntoRepeaterItemActions = injectItemActions;
