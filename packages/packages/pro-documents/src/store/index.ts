import { ProDocument } from '../types';
import { addSlice, PayloadAction } from '@elementor/store';

type State = {
	entities: Record<ProDocument['id'], ProDocument>,
}

export type Slice = ReturnType<typeof createSlice>;

const initialState: State = {
	entities: {},
};

export function createSlice() {
	return addSlice( {
		name: 'pro-documents',
		initialState,
		reducers: {
			init( state, { payload } : PayloadAction<State> ) {
				state.entities = payload.entities;
			},

			addDocument( state, { payload } : PayloadAction<ProDocument> ) {
				state.entities[ payload.id ] = payload;
			},
		},
	} );
}
