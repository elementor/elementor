import { __registerSlice as registerSlice } from '@elementor/store';

import { initStructureGuards } from './closed-structure/structure-guards';
import { initWidgetGeneral } from './general/init-widget-general';
import { loadCompositeWidgetsFromConfig } from './store/load-composite-widgets';
import { slice } from './store/store';
import { initWidgetStyle } from './style/init-widget-style';
import { initExpandWidgetOnDrop } from './sync/expand-widget-on-drop';

export function init() {
	registerSlice( slice );
	loadCompositeWidgetsFromConfig();

	initExpandWidgetOnDrop();
	initStructureGuards();
	initWidgetGeneral();
	initWidgetStyle();
}
