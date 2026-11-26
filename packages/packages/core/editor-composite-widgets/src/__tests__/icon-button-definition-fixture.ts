import { type StyleDefinition } from '@elementor/editor-styles';

import { type CompositeWidgetDefinition } from '../types';

export const GLOBAL_CLASS_ID = 'g-123abc';

export const LOCAL_ROOT_STYLE = {
	id: 'local-root',
	type: 'class',
	label: 'local',
	variants: [
		{
			meta: { breakpoint: 'desktop', state: null },
			props: { padding: { $$type: 'size', value: { size: 12, unit: 'px' } } },
			custom_css: null,
		},
	],
} as StyleDefinition;

export function createIconButtonDefinition(): CompositeWidgetDefinition {
	return {
		id: 'elementor/icon-button',
		version: 1,
		source: 'code',
		title: 'Icon button',
		template: {
			elType: 'e-flexbox',
			part: 'root',
			settings: {
				classes: { $$type: 'classes', value: [ 'local-root', GLOBAL_CLASS_ID ] },
			},
			styles: { 'local-root': LOCAL_ROOT_STYLE },
			elements: [
				{ elType: 'widget', widgetType: 'e-svg', part: 'icon' },
				{
					elType: 'widget',
					widgetType: 'e-paragraph',
					part: 'label',
					settings: { paragraph: { $$type: 'escaped-html', value: 'Click me' } },
				},
			],
		},
	};
}
