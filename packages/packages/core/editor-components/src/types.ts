import { type V1ElementData, type V1ElementModelProps, type V1ElementSettingsProps } from '@elementor/editor-elements';
import type { StyleDefinition } from '@elementor/editor-styles';

export type ComponentFormValues = {
	componentName: string;
};

export type ComponentId = number;

export type StylesDefinition = Record< ComponentId, StyleDefinition[] >;

export type Component = PublishedComponent | UnpublishedComponent;

export type PublishedComponent = {
	uuid: string;
	id: number;
	name: string;
};

export type UnpublishedComponent = {
	uuid: string;
	name: string;
	elements: V1ElementData[];
};

export type DocumentStatus = 'publish' | 'draft' | 'autosave';

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
	elementorCommon: Record< string, unknown > & {
		eventsManager: {
			config: {
				locations: Record< string, string >;
				secondaryLocations: Record< string, string >;
				triggers: Record< string, string >;
			};
		};
	};
};
