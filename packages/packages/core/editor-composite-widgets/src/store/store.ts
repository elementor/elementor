import { __createSlice as createSlice, type PayloadAction, type SliceState } from '@elementor/store';

import { type CompositeWidgetDefinitions } from '../types';

export const SLICE_NAME = 'compositeWidgets';

type CompositeWidgetsState = {
	loaded: CompositeWidgetDefinitions | null;
};

const initialState: CompositeWidgetsState = {
	loaded: null,
};

export const slice = createSlice( {
	name: SLICE_NAME,
	initialState,
	reducers: {
		load: ( state, { payload }: PayloadAction< CompositeWidgetDefinitions > ) => {
			state.loaded = payload;
		},
	},
} );

export const selectLoadedDefinitions = ( state: SliceState< typeof slice > ): CompositeWidgetDefinitions | null =>
	state[ SLICE_NAME ]?.loaded ?? null;
