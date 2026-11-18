import { __getStore as getStore } from '@elementor/store';

import { selectDefinitions } from '../store/store';
import { type CompositeWidgetDefinition } from '../types';

export function getCompositeWidgetDefinition( widgetId: string ): CompositeWidgetDefinition | null {
	const state = getStore()?.getState();

	return state ? selectDefinitions( state )[ widgetId ] ?? null : null;
}
