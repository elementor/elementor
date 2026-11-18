import { __privateListenTo as listenTo, v1ReadyEvent } from '@elementor/editor-v1-adapters';
import { __registerSlice as registerSlice } from '@elementor/store';

import { initStructureGuards } from './closed-structure/structure-guards';
import { initWidgetGeneral } from './general/init-widget-general';
import { loadCompositeWidgetsFromConfig } from './store/load-composite-widgets';
import { slice } from './store/store';
import { initExpandWidgetOnDrop } from './sync/expand-widget-on-drop';

export function init() {
	registerSlice( slice );

	listenTo( v1ReadyEvent(), loadCompositeWidgetsFromConfig );

	initExpandWidgetOnDrop();
	initStructureGuards();
	initWidgetGeneral();
}
