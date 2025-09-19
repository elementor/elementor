import {
	__createSelector as createSelector,
	__createSlice as createSlice,
	type PayloadAction,
	type SliceState,
} from '@elementor/store';

import loadComponents from './load-components';
import { type Component } from './types';

type GetComponentResponse = Component[];

export type ComponentsState = {
	data: Component[];
	loadStatus: 'idle' | 'pending';
};

export const initialState: ComponentsState = {
	data: [],
	loadStatus: 'idle',
};

const SLICE_NAME = 'components';
export const slice = createSlice( {
	name: SLICE_NAME,
	initialState,
	reducers: {
		load: ( state, { payload } ) => {
			state.data = payload;
		},
	},
	extraReducers: ( builder ) => {
		builder.addCase( loadComponents.fulfilled, ( state, { payload }: PayloadAction< GetComponentResponse > ) => {
			state.data = payload;
			state.loadStatus = 'idle';
		} );
		builder.addCase( loadComponents.pending, ( state ) => {
			state.loadStatus = 'pending';
		} );
		builder.addCase( loadComponents.rejected, ( state ) => {
			state.loadStatus = 'idle';
		} );
	},
} );

const selectData = ( state: SliceState< typeof slice > ) => state[ SLICE_NAME ].data;

export const selectComponents = createSelector( selectData, ( data: Component[] ) => data );
export const selectLoadStatus = ( state: SliceState< typeof slice > ) => state[ SLICE_NAME ].loadStatus;
