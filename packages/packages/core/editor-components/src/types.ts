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

export type DocumentStatus = 'publish' | 'draft' | 'autosave';

export type ExtendedWindow = Window & {
	elementorCommon: Record< string, unknown >;
};
