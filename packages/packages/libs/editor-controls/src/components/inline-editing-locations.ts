import { type ElementID } from '@elementor/editor-elements';
import { createLocation } from '@elementor/locations';

export const {
	Slot: InlineEditingControlHeaderSlot,
	inject: injectIntoInlineEditingControlHeader,
	useInjections: useInlineEditingControlHeaderInjections,
} = createLocation< {
	elementId: ElementID;
} >();
