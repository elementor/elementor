import { type PropsSchema, type PropValue } from '@elementor/editor-props';
import { type StyleDefinition, type StyleDefinitionID } from '@elementor/editor-styles';

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
		eventsManager?: {
			dispatchEvent: ( name: string, data: Record< string, unknown > ) => void;
			config?: {
				locations: Record< string, string >;
				secondaryLocations: Record< string, string >;
				triggers: Record< string, string >;
				elements?: Record< string, string >;
				names: {
					topBar?: Record< string, string >;
					v1?: Record< string, string >;
					elementorEditor?: {
						transitions?: {
							clickAddedTransition?: string;
						};
						variables?: {
							open?: string;
							add?: string;
							connect?: string;
							save?: string;
						};
					};
				};
			};
		};
	};
};

export type V1Element = {
	id: string;
	model: V1Model< V1ElementModelProps >;
	settings: V1Model< V1ElementSettingsProps >;
	children?: V1Element[];
	view?: {
		el?: HTMLElement;
		getDomElement?: () => {
			get?: ( index: number ) => HTMLElement | undefined;
		};
	};
	parent?: V1Element;
};

export type V1ElementModelProps = {
	widgetType?: string;
	elType: string;
	id: string;
	styles?: Record< StyleDefinitionID, StyleDefinition >;
	elements?: V1Model< V1ElementModelProps >[];
	settings?: V1Model< V1ElementSettingsProps >;
};

export type V1ElementSettingsProps = Record< string, PropValue >;

export type V1ElementConfig = {
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
};

type V1Model< T > = {
	get: < K extends keyof T >( key: K ) => T[ K ];
	set: < K extends keyof T >( key: K, value: T[ K ] ) => void;
	toJSON: () => T;
};
