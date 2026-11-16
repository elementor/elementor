import { injectIntoSettingsTab } from '@elementor/editor-editing-panel';
import { type Element, getContainer } from '@elementor/editor-elements';

import { isRegisteredWidgetRoot } from '../closed-structure/find-locking-widget-root';
import { WidgetGeneralTab } from './widget-general-tab';

export function initWidgetGeneral() {
	injectIntoSettingsTab( {
		id: 'composite-widget-general',
		condition: ( { element } ) => isSelectedWidgetRoot( element ),
		component: WidgetGeneralTab,
	} );
}

function isSelectedWidgetRoot( element: Element ): boolean {
	const container = getContainer( element.id );

	return !! container && isRegisteredWidgetRoot( container );
}
