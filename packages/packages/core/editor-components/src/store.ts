import { __createSelector as createSelector, __createSlice, type SliceState } from '@elementor/store';

import { type Component } from './types';

export type ComponentsState = {
	data: Component[];
};

export const initialState = {
	data: [],
};

const SLICE_NAME = 'components';
export const slice = __createSlice( {
	name: SLICE_NAME,
	initialState,
	reducers: {
		load: ( state, { payload } ) => {
			state.data = payload;
		},
	},
} );

const selectData = ( state: SliceState< typeof slice > ) => state[ SLICE_NAME ].data;

export const selectComponents = createSelector( selectData, ( data: Component[] ) => data );
