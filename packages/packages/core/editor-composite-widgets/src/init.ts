import { injectTab } from '@elementor/editor-elements-panel';
import { __registerSlice as registerSlice } from '@elementor/store';
import { __ } from '@wordpress/i18n';

import { initStructureGuards } from './closed-structure/structure-guards';
import { initWidgetGeneral } from './general/init-widget-general';
import { initNavigatorIcon } from './navigator/init-navigator-icon';
import { initNavigatorTitle } from './navigator/init-navigator-title';
import { CompositeWidgetsTab } from './panel/composite-widgets-tab';
import { loadCompositeWidgetsFromConfig } from './store/load-composite-widgets';
import { slice } from './store/store';
import { initWidgetStyle } from './style/init-widget-style';
import { initExpandWidgetOnDrop } from './sync/expand-widget-on-drop';

const COMPOSITE_WIDGETS_TAB_ID = 'composite-widgets';

export function init() {
	registerSlice( slice );
	loadCompositeWidgetsFromConfig();

	initExpandWidgetOnDrop();
	initStructureGuards();
	initWidgetGeneral();
	initWidgetStyle();
	initNavigatorIcon();
	initNavigatorTitle();

	injectTab( {
		id: COMPOSITE_WIDGETS_TAB_ID,
		label: __( 'Saved widgets', 'elementor' ),
		component: CompositeWidgetsTab,
	} );
}
