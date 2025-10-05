// import { type StyleDefinition } from '@elementor/editor-styles';
// import {
// 	__createSelector as createSelector,
// 	__createSlice as createSlice,
// 	type PayloadAction,
// 	type SliceState,
// } from '@elementor/store';
//
// type State = {
// 	data: Record< InitialDocumentId, StyleDefinition[] >;
// };
//
// const initialState: State = {
// 	data: {},
// };
//
// export type StateWithInitialDocumentsStyles = SliceState< typeof slice >;
//
// export const SLICE_NAME = 'components-styles';
//
// export const slice = createSlice( {
// 	name: SLICE_NAME,
// 	initialState,
// 	reducers: {
// 		add( state, { payload }: PayloadAction< Record< InitialDocumentId, StyleDefinition[] > > ) {
// 			state.data = { ...state.data, ...payload };
// 		},
// 	},
// } );
//
// export const selectData = ( state: StateWithInitialDocumentsStyles ) => state[ SLICE_NAME ].data;
// export const selectFlatData = createSelector( selectData, ( data ) => Object.values( data ).flat() );
