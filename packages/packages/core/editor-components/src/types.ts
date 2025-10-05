import { type V1ElementModelProps, type V1ElementSettingsProps } from '@elementor/editor-elements';
import { type NumberPropValue } from '@elementor/editor-props';
import type { StyleDefinition } from '@elementor/editor-styles';

export type ComponentFormValues = {
	componentName: string;
};

export type ComponentId = number;

export type StylesDefinition = Record< ComponentId, StyleDefinition[] >;

export type Component = {
	id: number;
	name: string;
};

export type Element = V1ElementModelProps & {
	elements?: Element[];
	settings?: V1ElementSettingsProps & {
		component_id?: NumberPropValue;
	};
};
