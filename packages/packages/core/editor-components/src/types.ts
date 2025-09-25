import { type V1Document } from '@elementor/editor-documents';
import { type V1ElementModelProps, type V1ElementSettingsProps } from '@elementor/editor-elements';
import { type NumberPropValue } from '@elementor/editor-props';
import { type StyleDefinition, type StyleDefinitionID } from '@elementor/editor-styles';

export type ComponentFormValues = {
	componentName: string;
};

export type Component = {
	id: number;
	name: string;
};

export type DocumentElement = {
	elements: Element[];
	styles?: Record< StyleDefinitionID, StyleDefinition >;
};

export type Element = V1ElementModelProps & {
	elements?: Element[];
	settings?: V1ElementSettingsProps & {
		component_id?: NumberPropValue;
	};
};

export type ExtendedWindow = Window & {
	elementor: {
		documents: {
			currentDocument: V1Document;
		};
	};
};
