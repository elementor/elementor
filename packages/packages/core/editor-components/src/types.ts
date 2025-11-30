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
	defaultValue: PropValue;
	groupId: string;
};

export type OverridablePropGroup = {
	id: string;
	label: string;
	props: string[];
};

export type OverridableProps = {
	props: Record< string, OverridableProp >;
	groups: {
		items: Record< string, OverridablePropGroup >;
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

export type Container = {
	model: {
		get: ( key: 'elements' ) => {
			toJSON: () => V1ElementData[];
		};
	};
};

export type ComponentInstancePropValue< TComponentId extends number | string = number | string > =
	TransformablePropValue<
		'component-instance',
		{
			component_id: TComponentId;
			overrides?: ComponentOverride[];
		}
	>;

type ComponentOverride = {
	override_key: string;
	value: TransformablePropValue< string >;
};
