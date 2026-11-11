import { type V1ElementData } from '@elementor/editor-elements';

export type CompositeWidgetTemplateNode = Omit< V1ElementData, 'id' | 'elements' | 'widget' > & {
	elements?: CompositeWidgetTemplateNode[];
};

export type CompositeWidgetDefinition = {
	id: string;
	version: number;
	title: string;
	icon?: string;
	template: CompositeWidgetTemplateNode;
};
