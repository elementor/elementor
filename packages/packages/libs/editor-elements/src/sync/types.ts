import { type PropsSchema, type PropValue, type TransformablePropValue } from '@elementor/editor-props';
import { type ClassState, type StyleDefinition, type StyleDefinitionID } from '@elementor/editor-styles';

import { type ControlItem } from '../types';

export type ExtendedWindow = Window & {
	elementor?: {
		selection?: {
			getElements: () => V1Element[];
		};
		widgetsCache?: Record< string, V1ElementConfig >;
		documents?: {
			getCurrent?: () =>
				| {
						container: V1Element;
				  }
				| undefined;
			getCurrentId?: () => number;
		};
		getContainer?: ( id: string ) => V1Element | undefined;
	};
	elementorCommon?: {
		helpers?: {
			getUniqueId?: () => string;
		};
	};
};

export type V1Element = {
	id: string;
	model: V1Model< V1ElementModelProps >;
	settings: V1Model< V1ElementSettingsProps >;
	children?: V1Element[] & {
		findRecursive?: ( predicate: ( child: V1Element ) => boolean ) => V1Element | undefined;
		forEachRecursive?: ( callback: ( child: V1Element ) => void ) => V1Element[];
	};
	view?: {
		el?: HTMLElement;
		_index?: number;
		getDomElement?: () => {
			get?: ( index: number ) => HTMLElement | undefined;
		};
	};
	parent?: V1Element;
};

export type ElementInteractions = {
	version: number;
	items: InteractionItem[];
};

export type InteractionItemValue = {
	interaction_id: TransformablePropValue<'string', string>;
	trigger: TransformablePropValue<'string', string>;
	animation: TransformablePropValue<'animation-preset-props', {
		effect: TransformablePropValue<'string', string>;
		type: TransformablePropValue<'string', string>;
		direction: TransformablePropValue<'string', string>;
		timing_config: TransformablePropValue<'timing-config', {
			duration: TransformablePropValue<'number', number>;
			delay: TransformablePropValue<'number', number>;
		}>;
	}>;
  };

export type InteractionItem = TransformablePropValue<'interaction-item', InteractionItemValue>;

export type V1ElementModelProps = {
	widgetType?: string;
	elType: string;
	id: string;
	styles?: Record< StyleDefinitionID, StyleDefinition >;
	elements?: V1Model< V1ElementModelProps >[];
	settings?: V1ElementSettingsProps;
	editor_settings?: V1ElementEditorSettingsProps;
	interactions?: string | ElementInteractions;
};

export type V1ElementData = Omit< V1ElementModelProps, 'elements' > & {
	elements?: V1ElementData[];
};

export type V1ElementEditorSettingsProps = {
	title?: string;
	initial_position?: number;
	component_uid?: string;
};

export type V1ElementSettingsProps = Record< string, PropValue >;

export type V1ElementConfig< T = object > = {
	title: string;
	controls: object;
	atomic?: boolean;
	atomic_controls?: ControlItem[];
	atomic_props_schema?: PropsSchema;
	dependencies_per_target_mapping?: Record< string, string[] >;
	twig_templates?: Record< string, string >;
	twig_main_template?: string;
	base_styles?: Record< string, StyleDefinition >;
	base_styles_dictionary?: Record< string, string >;
	atomic_style_states?: ClassState[];
} & T;

type V1Model< T > = {
	get: < K extends keyof T >( key: K ) => T[ K ];
	set: < K extends keyof T >( key: K, value: T[ K ] ) => void;
	toJSON: ( options?: { remove?: string[] } ) => T;
};
