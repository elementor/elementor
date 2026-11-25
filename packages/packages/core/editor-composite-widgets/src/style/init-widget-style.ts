import { injectIntoStyleTabContent } from '@elementor/editor-editing-panel';

import { isSelectedWidgetRoot } from '../closed-structure/is-selected-widget-root';
import { WidgetStyleTab } from './widget-style-tab';

export function initWidgetStyle() {
	injectIntoStyleTabContent( {
		id: 'composite-widget-style',
		condition: ( { element } ) => isSelectedWidgetRoot( element ),
		component: WidgetStyleTab,
	} );
}
