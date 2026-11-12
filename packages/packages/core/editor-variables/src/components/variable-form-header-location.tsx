import { createLocation } from '@elementor/locations';

export type VariableFormHeaderProps = {
	variableType: string;
	variableId?: string;
	label?: string;
};

export const {
	Slot: VariableFormHeaderSlot,
	inject: injectIntoVariableFormHeader,
	useInjections: useVariableFormHeaderInjections,
} = createLocation< VariableFormHeaderProps >();
