import { type ElementID } from '@elementor/editor-elements';
import { createLocation } from '@elementor/locations';

export type InteractionsHeaderProps = {
	elementId: ElementID;
};

export const {
	Slot: InteractionsHeaderSlot,
	inject: injectIntoInteractionsHeader,
	useInjections: useInteractionsHeaderInjections,
} = createLocation< InteractionsHeaderProps >();
