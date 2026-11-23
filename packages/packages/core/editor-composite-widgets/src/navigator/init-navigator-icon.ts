import { WIDGET_MARKER_KEYS } from '@elementor/editor-elements';

import { addLegacyFilter } from './add-legacy-filter';
import { type ElementModel } from './types';

export const NAVIGATOR_ICON_FILTER = 'navigator/element/icon';
export const COMPOSITE_WIDGET_ICON = 'eicon-composite-widgets';

export function initNavigatorIcon() {
	addLegacyFilter( NAVIGATOR_ICON_FILTER, resolveNavigatorIcon );
}

export function resolveNavigatorIcon( icon: string, model: ElementModel ): string {
	return model.get( WIDGET_MARKER_KEYS.widget ) ? COMPOSITE_WIDGET_ICON : icon;
}
