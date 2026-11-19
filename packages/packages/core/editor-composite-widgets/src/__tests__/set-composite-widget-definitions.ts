import {
	__createStore as createStore,
	__deleteStore as deleteStore,
	__dispatch as dispatch,
	__registerSlice as registerSlice,
} from '@elementor/store';

import { slice } from '../store/store';
import { type CompositeWidgetDefinitions } from '../types';

export function setCompositeWidgetDefinitions( definitions: CompositeWidgetDefinitions ) {
	deleteStore();
	registerSlice( slice );
	createStore();
	dispatch( slice.actions.load( definitions ) );
}
