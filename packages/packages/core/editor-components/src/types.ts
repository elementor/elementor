import { type V1ElementData, type V1ElementModelProps, type V1ElementSettingsProps } from '@elementor/editor-elements';
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

export type DocumentStatus = 'publish' | 'draft';
export type DocumentSaveStatus = DocumentStatus | 'autosave';

export type Element = V1ElementModelProps & {
	elements?: Element[];
	settings?: V1ElementSettingsProps & {
		component?: {
			$$type: 'component-id';
			value: number;
		};
	};
};

export type ExtendedWindow = Window & {
	elementorCommon: Record< string, unknown >;
};

export type Container = {
	model: {
		get: ( key: 'elements' ) => {
			toJSON: () => V1ElementData[];
		};
	};
};
