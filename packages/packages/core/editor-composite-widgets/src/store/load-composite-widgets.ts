import { __dispatch as dispatch } from '@elementor/store';

import { apiClient } from '../api';
import { type CompositeWidgetDefinitions } from '../types';
import { slice } from './store';
import { toDefinitionsMap } from './to-definitions-map';

type WindowWithCompositeWidgets = Window & {
	elementor?: {
		config?: {
			compositeWidgets?: CompositeWidgetDefinitions | [];
		};
	};
};

export function loadCompositeWidgetsFromConfig() {
	const definitions = ( window as unknown as WindowWithCompositeWidgets ).elementor?.config?.compositeWidgets;

	dispatch( slice.actions.load( toDefinitionsMap( definitions ) ) );
}

export async function loadCompositeWidgets() {
	const definitions = await apiClient.getDefinitions();

	dispatch( slice.actions.load( definitions ) );
}
