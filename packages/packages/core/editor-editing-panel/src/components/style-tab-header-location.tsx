import { type ElementID } from '@elementor/editor-elements';
import { createLocation } from '@elementor/locations';

export type StyleTabHeaderProps = {
	elementId: ElementID;
};

export const {
	Slot: StyleTabHeaderSlot,
	inject: injectIntoStyleTabHeader,
	useInjections: useStyleTabHeaderInjections,
} = createLocation< StyleTabHeaderProps >();
