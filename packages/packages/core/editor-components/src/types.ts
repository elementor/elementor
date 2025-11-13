import { type V1ElementData } from '@elementor/editor-elements';
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
