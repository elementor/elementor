import { addSlice, PayloadAction } from '@elementor/store';
import { PartialDocument, State, Document } from '../types';

const initialState: State = {
	entities: {},
	currentId: 0,
};

export function createSlice() {
	return addSlice( {
		name: 'documents',
		initialState,
		reducers: {
			setDocuments( state, action: PayloadAction<State['entities']> ) {
				state.entities = action.payload;
			},

			setCurrentDocumentId( state, action: PayloadAction<State['currentId']> ) {
				state.currentId = action.payload;
			},

			addDocument( state, action: PayloadAction<Document> ) {
				state.entities[ action.payload.id ] = action.payload;
			},

			updateDocument( state, action: PayloadAction<PartialDocument> ) {
				state.entities[ action.payload.id ] = {
					...state.entities[ action.payload.id ],
					...action.payload,
				};
			},
		},
	} );
}

