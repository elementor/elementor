import { __dispatch as dispatch } from '@elementor/store';

import { apiClient } from '../api';
import { type CompositeWidgetDefinitions } from '../types';
import { slice } from './store';
import { toDefinitionsMap } from './to-definitions-map';

type WindowWithElementorConfig = Window & {
	ElementorConfig?: {
		compositeWidgets?: CompositeWidgetDefinitions | [];
	};
};

/**
 * Runs from the package init, before the editor starts: `elementor.config` isn't set yet, but it will be
 * this same `ElementorConfig` object. The store holds the action until the editor creates it, so the
 * definitions are there before the panel, the canvas or the Navigator first render.
 */
export function loadCompositeWidgetsFromConfig() {
	const definitions = ( window as unknown as WindowWithElementorConfig ).ElementorConfig?.compositeWidgets;

	dispatch( slice.actions.load( toDefinitionsMap( definitions ) ) );
}

export async function loadCompositeWidgets() {
	const definitions = await apiClient.getDefinitions();

	dispatch( slice.actions.load( definitions ) );
}
