import { createLocation } from '@elementor/locations';

export type StyleTabHeaderProps = {
	elementId: string;
};

export const {
	Slot: StyleTabHeaderSlot,
	inject: injectIntoStyleTabHeader,
	useInjections: useStyleTabHeaderInjections,
} = createLocation< StyleTabHeaderProps >();
