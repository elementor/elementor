import {
	__createSelector as createSelector,
	__createSlice as createSlice,
	type PayloadAction,
	type SliceState,
} from '@elementor/store';

import { createComponent, loadComponents } from './actions';
import { type Component } from './types';

type GetComponentResponse = Component[];

type Status = 'idle' | 'pending' | 'error';
export type ComponentsState = {
	data: Component[];
	loadStatus: Status;
	createStatus: Status;
};

export const initialState: ComponentsState = {
	data: [],
	loadStatus: 'idle',
	createStatus: 'idle',
};

const SLICE_NAME = 'components';
export const slice = createSlice( {
	name: SLICE_NAME,
	initialState,
	reducers: {
		add: ( state, { payload } ) => {
			state.data.push( payload );
		},
		load: ( state, { payload } ) => {
			state.data = payload;
		},
		clearCreateStatus: ( state ) => {
			state.createStatus = 'idle';
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
			state.loadStatus = 'error';
		} );
		builder.addCase( createComponent.fulfilled, ( state, { payload, meta } ) => {
			state.createStatus = 'idle';
			state.data.push( {
				id: payload.component_id,
				name: meta.arg.name,
			} );
		} );
		builder.addCase( createComponent.pending, ( state ) => {
			state.createStatus = 'pending';
		} );
		builder.addCase( createComponent.rejected, ( state ) => {
			state.createStatus = 'error';
		} );
	},
} );

const selectData = ( state: SliceState< typeof slice > ) => state[ SLICE_NAME ].data;

export const selectComponents = createSelector( selectData, ( data: Component[] ) => data );
export const selectLoadStatus = ( state: SliceState< typeof slice > ) => state[ SLICE_NAME ].loadStatus;
export const selectCreateStatus = ( state: SliceState< typeof slice > ) => state[ SLICE_NAME ].createStatus;
