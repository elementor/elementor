import { __getStore as getStore, type Store } from '@elementor/store';

import { setCompositeWidgetDefinitions } from '../../__tests__/set-composite-widget-definitions';
import { type CompositeWidgetDefinition, type CompositeWidgetDefinitions } from '../../types';

export function createDefinition(
	id: string,
	overrides: Partial< CompositeWidgetDefinition > = {}
): CompositeWidgetDefinition {
	return {
		id,
		version: 1,
		source: 'site',
		title: id,
		insertable: true,
		template: { elType: 'e-flexbox', part: 'root' },
		...overrides,
	};
}

export function setupStore( definitions: CompositeWidgetDefinition[] ): Store {
	const map: CompositeWidgetDefinitions = Object.fromEntries(
		definitions.map( ( definition ) => [ definition.id, definition ] )
	);

	setCompositeWidgetDefinitions( map );

	return getStore() as Store;
}
