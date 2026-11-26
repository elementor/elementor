import { type V1ElementData } from '@elementor/editor-elements';
import { type Props } from '@elementor/editor-props';

export type CompositeWidgetTemplateNode = Omit< V1ElementData, 'id' | 'elements' | 'widget' > & {
	elements?: CompositeWidgetTemplateNode[];
};

export type CompositeWidgetPartReference = {
	part: string;
};

export type CompositeWidgetFieldTarget = {
	part: string;
	prop: string;
};

export type CompositeWidgetField = {
	label: string;
	target: CompositeWidgetFieldTarget;
	removable?: boolean | CompositeWidgetPartReference;
};

export type CompositeWidgetFieldGroup = {
	label: string;
	removable?: CompositeWidgetPartReference;
	fields: CompositeWidgetField[];
};

export type CompositeWidgetGeneralSection = {
	section: string;
	fields: Array< CompositeWidgetField | CompositeWidgetFieldGroup >;
};

export type CompositeWidgetRepeater = {
	repeater: string;
	label: string;
	item: string;
	container: string;
	item_fields: CompositeWidgetField[];
	item_label?: CompositeWidgetFieldTarget;
	list_fields?: CompositeWidgetField[];
	prototype?: CompositeWidgetTemplateNode;
	min?: number;
	max?: number;
};

export type CompositeWidgetGeneralEntry = CompositeWidgetGeneralSection | CompositeWidgetRepeater;

export type CompositeWidgetQuickEdit = {
	label: string;
	style_prop: string;
	targets: string[];
};

export type CompositeWidgetPresetWrite = {
	part: string;
	style: Record< string, Props >;
};

export type CompositeWidgetPresetOption = {
	id: string;
	label: string;
	set: CompositeWidgetPresetWrite[];
};

export type CompositeWidgetPreset = {
	id: string;
	label: string;
	options: CompositeWidgetPresetOption[];
};

export type CompositeWidgetStyle = {
	appearance?: CompositeWidgetPreset[];
	quick_edit?: CompositeWidgetQuickEdit[];
};

export type CompositeWidgetDefinition = {
	id: string;
	version: number;
	title: string;
	icon?: string;
	template: CompositeWidgetTemplateNode;
	general?: CompositeWidgetGeneralEntry[];
	style?: CompositeWidgetStyle;
	archived?: boolean;
};

export type CompositeWidgetDefinitions = Record< string, CompositeWidgetDefinition >;
