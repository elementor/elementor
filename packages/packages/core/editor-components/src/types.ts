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

export type OverridableProp = {
	overrideKey: string;
	label: string;
	elementId: string;
	propKey: string;
	elType: string;
	widgetType: string;
	originValue: PropValue;
	groupId: string;
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

<<<<<<< HEAD
=======
export type ComponentInstancePropValue< TComponentId extends number | string = number | string > =
	TransformablePropValue<
		'component-instance',
		{
			component_id: TransformablePropValue< 'number', TComponentId >;
			overrides?: TransformablePropValue< 'overrides', ComponentOverrides >;
		}
	>;

type ComponentOverrides = TransformablePropValue< 'overrides', ComponentOverride[] >;

type ComponentOverride = TransformablePropValue< 'override', ComponentOverridePropValue >;

export type ComponentOverridePropValue = {
	override_key: string;
	override_value: TransformablePropValue< string >;
	schema_source: {
		type: string;
		id: number;
	};
};

>>>>>>> b4a39616ac7b5fa024e3283025500c562547b042
export type ComponentOverridable = {
	override_key: string;
	origin_value: TransformablePropValue< string >;
};
