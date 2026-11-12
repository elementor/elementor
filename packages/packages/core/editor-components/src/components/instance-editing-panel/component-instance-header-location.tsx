import { type ElementID } from '@elementor/editor-elements';
import { createLocation } from '@elementor/locations';

export type ComponentInstanceHeaderProps = {
	componentId: string;
	elementId: ElementID;
};

export const {
	Slot: ComponentInstanceHeaderSlot,
	inject: injectIntoComponentInstanceHeader,
	useInjections: useComponentInstanceHeaderInjections,
} = createLocation< ComponentInstanceHeaderProps >();
