import { __getStore as getStore } from '@elementor/store';

import { selectLoadedDefinitions } from '../store/store';
import { type CompositeWidgetDefinition, type CompositeWidgetDefinitions } from '../types';

type WindowWithCompositeWidgets = Window & {
	elementor?: {
		config?: {
			compositeWidgets?: CompositeWidgetDefinitions;
		};
	};
};

export function getCompositeWidgetDefinition( widgetId: string ): CompositeWidgetDefinition | null {
	return getDefinitions()?.[ widgetId ] ?? null;
}

/**
 * The editor config is the snapshot from page load; definitions loaded later over REST replace it.
 */
function getDefinitions(): CompositeWidgetDefinitions | undefined {
	const state = getStore()?.getState();
	const loaded = state ? selectLoadedDefinitions( state ) : null;

	return loaded ?? ( window as unknown as WindowWithCompositeWidgets ).elementor?.config?.compositeWidgets;
}
