import { createLocation } from '@elementor/locations';

import { type CompositeWidgetDefinition } from '../types';

export type CompositeWidgetItemMenuProps = {
	definition: CompositeWidgetDefinition;
	closeMenu: () => void;
};

export const {
	Slot: CompositeWidgetItemMenuSlot,
	inject: injectIntoCompositeWidgetItemMenu,
	useInjections: useCompositeWidgetItemMenuInjections,
} = createLocation< CompositeWidgetItemMenuProps >();
