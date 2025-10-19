import {
	__createSelector as createSelector,
	__createSlice as createSlice,
	type PayloadAction,
	type SliceState,
} from '@elementor/store';

import { type Component, type ComponentId, type StylesDefinition } from '../types';
import { createComponent, loadComponents } from './thunks';

type GetComponentResponse = Component[];

type Status = 'idle' | 'pending' | 'error';

type ComponentsState = {
	data: Component[];
	loadStatus: Status;
	createStatus: Status;
	styles: StylesDefinition;
};

type ComponentsSlice = SliceState< typeof slice >;

export const initialState: ComponentsState = {
	data: [],
	loadStatus: 'idle',
	createStatus: 'idle',
	styles: {},
};

export const SLICE_NAME = 'components';
export const slice = createSlice( {
	name: SLICE_NAME,
	initialState,
	reducers: {
		add: ( state, { payload } ) => {
			state.data = { ...payload };
		},
		load: ( state, { payload } ) => {
			state.data = payload;
		},
		removeStyles( state, { payload }: PayloadAction< { id: ComponentId } > ) {
			const { [ payload.id ]: _, ...rest } = state.styles;

			state.styles = rest;
		},
		addStyles: ( state, { payload } ) => {
			state.styles = { ...state.styles, ...payload };
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

const selectData = ( state: ComponentsSlice ) => state[ SLICE_NAME ].data;
const selectLoadStatus = ( state: ComponentsSlice ) => state[ SLICE_NAME ].loadStatus;
const selectCreateStatus = ( state: ComponentsSlice ) => state[ SLICE_NAME ].createStatus;
const selectStylesDefinitions = ( state: ComponentsSlice ) => state[ SLICE_NAME ].styles ?? {};

export const selectComponents = createSelector( selectData, ( data: Component[] ) => data );
export const selectLoadIsPending = createSelector( selectLoadStatus, ( status ) => status === 'pending' );
export const selectLoadIsError = createSelector( selectLoadStatus, ( status ) => status === 'error' );
export const selectCreateIsPending = createSelector( selectCreateStatus, ( status ) => status === 'pending' );
export const selectCreateIsError = createSelector( selectCreateStatus, ( status ) => status === 'error' );
export const selectStyles = ( state: ComponentsSlice ) => state[ SLICE_NAME ].styles ?? {};
export const selectFlatStyles = createSelector( selectStylesDefinitions, ( data ) => Object.values( data ).flat() );
