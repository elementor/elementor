import { WIDGET_MARKER_KEYS } from '@elementor/editor-elements';

import { getCompositeWidgetDefinition } from '../sync/get-composite-widget-definition';
import { addLegacyFilter } from './add-legacy-filter';
import { type ElementModel } from './types';

export const NAVIGATOR_TITLE_FILTER = 'navigator/element/title';

export function initNavigatorTitle() {
	addLegacyFilter( NAVIGATOR_TITLE_FILTER, resolveNavigatorTitle );
}

export function resolveNavigatorTitle( title: string, model: ElementModel ): string {
	const widget = model.get( WIDGET_MARKER_KEYS.widget ) as { id?: string } | undefined;

	if ( ! widget?.id || hasUserTitle( model ) ) {
		return title;
	}

	return getCompositeWidgetDefinition( widget.id )?.title || title;
}

function hasUserTitle( model: ElementModel ): boolean {
	const editorSettings = model.get( 'editor_settings' ) as { title?: string } | undefined;

	return Boolean( editorSettings?.title );
}
