import {
	__createSelector as createSelector,
	__createSlice as createSlice,
	type PayloadAction,
	type SliceState,
} from '@elementor/store';

import {
	type Component,
	type ComponentId,
	type PublishedComponent,
	type StylesDefinition,
	type UnpublishedComponent,
} from '../types';
import { loadComponents } from './thunks';

type GetComponentResponse = PublishedComponent[];

type Status = 'idle' | 'pending' | 'error';

type ComponentsState = {
	data: PublishedComponent[];
	unpublishedData: UnpublishedComponent[];
	loadStatus: Status;
	styles: StylesDefinition;
	createdThisSession: Component[ 'uid' ][];
	archivedData: PublishedComponent[];
};

type ComponentsSlice = SliceState< typeof slice >;

export const initialState: ComponentsState = {
	data: [],
	unpublishedData: [],
	loadStatus: 'idle',
	styles: {},
	createdThisSession: [],
	archivedData: [],
};

export const SLICE_NAME = 'components';
export const slice = createSlice( {
	name: SLICE_NAME,
	initialState,
	reducers: {
		add: ( state, { payload }: PayloadAction< PublishedComponent | PublishedComponent[] > ) => {
			if ( Array.isArray( payload ) ) {
				state.data = [ ...state.data, ...payload ];
			} else {
				state.data.unshift( payload );
			}
		},
		load: ( state, { payload }: PayloadAction< PublishedComponent[] > ) => {
			state.data = payload;
		},
		addUnpublished: ( state, { payload }: PayloadAction< UnpublishedComponent > ) => {
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
		addCreatedThisSession: ( state, { payload }: PayloadAction< string > ) => {
			state.createdThisSession.push( payload );
		},
		archive: ( state, { payload }: PayloadAction< number > ) => {
			state.archivedData.push(
				state.data.find( ( component ) => component.id === payload ) as PublishedComponent
			);
			state.data = state.data.filter( ( component ) => component.id !== payload );
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
const selectArchivedData = ( state: ComponentsSlice ) => state[ SLICE_NAME ].archivedData;
const selectLoadStatus = ( state: ComponentsSlice ) => state[ SLICE_NAME ].loadStatus;
const selectStylesDefinitions = ( state: ComponentsSlice ) => state[ SLICE_NAME ].styles ?? {};
const selectUnpublishedData = ( state: ComponentsSlice ) => state[ SLICE_NAME ].unpublishedData;
const getCreatedThisSession = ( state: ComponentsSlice ) => state[ SLICE_NAME ].createdThisSession;
const selectComponent = ( state: ComponentsSlice, componentId: ComponentId ) =>
	state[ SLICE_NAME ].data.find( ( component ) => component.id === componentId );

export const selectComponents = createSelector(
	selectData,
	selectUnpublishedData,
	( data: PublishedComponent[], unpublishedData: UnpublishedComponent[] ) => [
		...unpublishedData.map( ( item ) => ( { uid: item.uid, name: item.name } ) ),
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
export const selectCreatedThisSession = createSelector(
	getCreatedThisSession,
	( createdThisSession ) => createdThisSession
);
export const selectOverridableProps = createSelector(
	selectComponent,
	( component: PublishedComponent | undefined ) => component?.overridableProps
);

export const selectArchivedComponents = createSelector(
	selectArchivedData,
	( archivedData: PublishedComponent[] ) => archivedData
);
