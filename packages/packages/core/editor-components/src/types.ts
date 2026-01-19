import { type RenderContext } from '@elementor/editor-canvas';
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
	isArchived?: boolean;
};

export type UnpublishedComponent = BaseComponent & {
	elements: V1ElementData[];
};

export type OriginPropFields = Pick<
	OverridableProp,
	'propKey' | 'widgetType' | 'elType' | 'elementId' | 'overrideKey'
>;

export type OverridableProp = {
	overrideKey: string;
	elementId: string;
	propKey: string;
	elType: string;
	widgetType: string;

	groupId: string;
	label: string;
	originValue: PropValue; // ?
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

export type ElementorStorage = {
	get: < T = unknown >( key: string ) => T | null;
	set: < T >( key: string, data: T ) => void;
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
		storage: ElementorStorage;
	};
};

export type ComponentOverridable = {
	override_key: string;
	origin_value: TransformablePropValue< string >;
};

export type ComponentRenderContext = RenderContext< {
	overrides?: Record< string, unknown >;
} >;

export type UpdatedComponentName = {
	componentId: number;
	title: string;
};
