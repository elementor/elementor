import { __createSelector as createSelector, __useSelector as useSelector } from '@elementor/store';

import { selectDefinitions } from '../store/store';
import { type CompositeWidgetDefinition } from '../types';

// Built-in (code) widgets will be listed in the regular widgets panel; this list is for stored site widgets only.
const isListedInPanel = ( definition: CompositeWidgetDefinition ) =>
	definition.source === 'site' && ! definition.archived && definition.insertable !== false;

const selectInsertableCompositeWidgets = createSelector( selectDefinitions, ( definitions ) =>
	Object.values( definitions ).filter( isListedInPanel )
);

export function useInsertableCompositeWidgets(): CompositeWidgetDefinition[] {
	return useSelector( selectInsertableCompositeWidgets );
}
