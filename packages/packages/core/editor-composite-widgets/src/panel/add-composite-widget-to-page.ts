import { dropElement, type DropElementParams } from '@elementor/editor-elements';

import { type CompositeWidgetDefinition } from '../types';
import { buildCompositeDropModel } from './build-composite-drop-model';
import { resolveInsertTarget } from './resolve-insert-target';
import { type PanelExtendedWindow } from './types';

const getExtendedWindow = () => window as unknown as PanelExtendedWindow;

export function canInsertCompositeWidgets() {
	const elementor = getExtendedWindow().elementor;

	return !! elementor?.getPreviewContainer?.() && !! elementor.userCan?.( 'design' );
}

export function addCompositeWidgetToPage( definition: CompositeWidgetDefinition ) {
	const target = resolveInsertTarget();

	if ( ! target ) {
		return;
	}

	const model = buildCompositeDropModel( definition );

	try {
		const result = dropElement( {
			containerId: target.containerId,
			model: model as DropElementParams[ 'model' ],
			options: { at: target.at, scrollIntoView: true },
		} );

		if ( result ) {
			trackAddElement( model.elType );
		}
	} catch {
		// A failed drop must leave the document untouched, so there is nothing to recover.
	}
}

function trackAddElement( elType: string ) {
	getExtendedWindow().elementorCommon?.eventsManager?.dispatchEvent?.( 'add_element', {
		location: 'editor_panel',
		element_name: elType,
		element_type: elType,
	} );
}
