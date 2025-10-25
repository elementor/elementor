import { type V1ElementData } from '@elementor/editor-elements';
import {
	__createSelector as createSelector,
	__createSlice as createSlice,
	type PayloadAction,
	type SliceState,
} from '@elementor/store';

import { type Component, type ComponentId, type StylesDefinition } from '../types';
import { loadComponents } from './thunks';

type GetComponentResponse = Component[];

export type UnpublishedComponent = Component & {
	elements: V1ElementData[];
};

type Status = 'idle' | 'pending' | 'error';

type ComponentsState = {
	data: Component[];
	unpublishedData: UnpublishedComponent[];
	loadStatus: Status;
	styles: StylesDefinition;
};

type ComponentsSlice = SliceState< typeof slice >;

export const initialState: ComponentsState = {
	data: [],
	unpublishedData: [],
	loadStatus: 'idle',
	styles: {},
};

export const SLICE_NAME = 'components';
export const slice = createSlice( {
	name: SLICE_NAME,
	initialState,
	reducers: {
		add: ( state, { payload }: PayloadAction< Component | Component[] > ) => {
			if ( Array.isArray( payload ) ) {
				state.data = [ ...state.data, ...payload ];
			} else {
				state.data.unshift( payload );
			}
		},
		load: ( state, { payload }: PayloadAction< Component[] > ) => {
			state.data = payload;
		},
		addUnpublished: ( state, { payload } ) => {
			state.unpublishedData.unshift( payload );
		},
		resetUnpublished: ( state ) => {
			state.unpublishedData = [];
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
	},
} );

const selectData = ( state: ComponentsSlice ) => state[ SLICE_NAME ].data;
const selectLoadStatus = ( state: ComponentsSlice ) => state[ SLICE_NAME ].loadStatus;
const selectStylesDefinitions = ( state: ComponentsSlice ) => state[ SLICE_NAME ].styles ?? {};
const selectUnpublishedData = ( state: ComponentsSlice ) => state[ SLICE_NAME ].unpublishedData;

export const selectComponents = createSelector(
	selectData,
	selectUnpublishedData,
	( data: Component[], unpublishedData: UnpublishedComponent[] ) => [
		...unpublishedData.map( ( item ) => ( { id: item.id, name: item.name } ) ),
		...data,
	]
);
export const selectUnpublishedComponents = createSelector(
	selectUnpublishedData,
	( unpublishedData: UnpublishedComponent[] ) => unpublishedData
);
export const selectLoadIsPending = createSelector( selectLoadStatus, ( status ) => status === 'pending' );
export const selectLoadIsError = createSelector( selectLoadStatus, ( status ) => status === 'error' );
export const selectStyles = ( state: ComponentsSlice ) => state[ SLICE_NAME ].styles ?? {};
export const selectFlatStyles = createSelector( selectStylesDefinitions, ( data ) => Object.values( data ).flat() );
