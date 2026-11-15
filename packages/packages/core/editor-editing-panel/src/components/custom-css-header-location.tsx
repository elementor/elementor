import { createLocation } from '@elementor/locations';

export type CustomCssHeaderProps = {
	elementId: string;
};

export const {
	Slot: CustomCssHeaderSlot,
	inject: injectIntoCustomCssHeader,
	useInjections: useCustomCssHeaderInjections,
} = createLocation< CustomCssHeaderProps >();
