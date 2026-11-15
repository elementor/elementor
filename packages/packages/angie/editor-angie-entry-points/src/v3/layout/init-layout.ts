import { __privateListenTo as listenTo, v1ReadyEvent } from '@elementor/editor-v1-adapters';

import { getExtendedWindow } from '../types';
import {
	ANGIE_LAYOUT_FILTER_PRIORITY,
	applyAngieAddSectionBehavior,
	applyAngieContainerContextMenu,
	applyAngieTemplateLibraryBehaviors,
} from './apply-angie-layout-entry-points';

const ADD_SECTION_BEHAVIORS_FILTER = 'views/add-section/behaviors';
const CONTAINER_CONTEXT_MENU_FILTER = 'elements/container/contextMenuGroups';
const TEMPLATE_LIBRARY_BEHAVIORS_FILTER = 'elementor/editor/template-library/template/behaviors';

export function initV3Layout(): void {
	listenTo( v1ReadyEvent(), () => {
		const hooks = getExtendedWindow().elementor?.hooks;

		if ( ! hooks?.addFilter ) {
			return;
		}

		hooks.addFilter( ADD_SECTION_BEHAVIORS_FILTER, applyAngieAddSectionBehavior, ANGIE_LAYOUT_FILTER_PRIORITY );

		hooks.addFilter(
			CONTAINER_CONTEXT_MENU_FILTER,
			applyAngieContainerContextMenu as unknown as ( groups: unknown, currentElement: unknown ) => unknown,
			ANGIE_LAYOUT_FILTER_PRIORITY
		);

		hooks.addFilter(
			TEMPLATE_LIBRARY_BEHAVIORS_FILTER,
			applyAngieTemplateLibraryBehaviors,
			ANGIE_LAYOUT_FILTER_PRIORITY
		);
	} );
}
