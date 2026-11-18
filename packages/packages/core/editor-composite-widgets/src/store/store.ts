import { __createSlice as createSlice, type PayloadAction, type SliceState } from '@elementor/store';

import { type CompositeWidgetDefinitions } from '../types';

export const SLICE_NAME = 'compositeWidgets';

type CompositeWidgetsState = {
	definitions: CompositeWidgetDefinitions;
};

const initialState: CompositeWidgetsState = {
	definitions: {},
};

export const slice = createSlice( {
	name: SLICE_NAME,
	initialState,
	reducers: {
		load: ( state, { payload }: PayloadAction< CompositeWidgetDefinitions > ) => {
			state.definitions = payload;
		},
	},
} );

export const selectDefinitions = ( state: SliceState< typeof slice > ): CompositeWidgetDefinitions =>
	state[ SLICE_NAME ]?.definitions ?? {};
