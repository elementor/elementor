import { injectIntoSettingsTab } from '@elementor/editor-editing-panel';

import { isSelectedWidgetRoot } from '../closed-structure/is-selected-widget-root';
import { WidgetGeneralTab } from './widget-general-tab';

export function initWidgetGeneral() {
	injectIntoSettingsTab( {
		id: 'composite-widget-general',
		condition: ( { element } ) => isSelectedWidgetRoot( element ),
		component: WidgetGeneralTab,
	} );
}
