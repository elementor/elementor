import { type V1ElementData } from '@elementor/editor-elements';
import { type PropValue, type TransformablePropValue } from '@elementor/editor-props';
import type { StyleDefinition } from '@elementor/editor-styles';

export type ComponentFormValues = {
	componentName: string;
};

export type ComponentId = number;

export type StylesDefinition = Record< ComponentId, StyleDefinition[] >;

export type Component = PublishedComponent | UnpublishedComponent;

export type PublishedComponent = BaseComponent & {
	id: number;
};

export type UnpublishedComponent = BaseComponent & {
	elements: V1ElementData[];
};

export type OriginPropFields = Pick< OverridableProp, 'propKey' | 'widgetType' | 'elType' >;

export type OverridableProp = {
	overrideKey: string;
	label: string;
	elementId: string;
	propKey: string;
	elType: string;
	widgetType: string;
	originValue: PropValue;
	groupId: string;
	originPropFields?: OriginPropFields;
};

export type OverridablePropsGroup = {
	id: string;
	label: string;
	props: string[];
};

export type OverridableProps = {
	props: Record< string, OverridableProp >;
	groups: {
		items: Record< string, OverridablePropsGroup >;
		order: string[];
	};
};

type BaseComponent = {
	uid: string;
	name: string;
	overridableProps?: OverridableProps;
};

export type DocumentStatus = 'publish' | 'draft';
export type DocumentSaveStatus = DocumentStatus | 'autosave';

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

export type ComponentOverridable = {
	override_key: string;
	origin_value: TransformablePropValue< string >;
};

export type UpdatedComponentName = {
	componentId: number;
	title: string;
};
