import { addSlice, PayloadAction } from '@elementor/store';
import { PartialDocument, State, Document } from '../types';

const initialState: State = {
	documents: {},
	currentDocumentId: 0,
};

export function createSlice() {
	return addSlice( {
		name: 'documents',
		initialState,
		reducers: {
			setDocuments( state, action: PayloadAction<State['documents']> ) {
				state.documents = action.payload;
			},

			setCurrentDocumentId( state, action: PayloadAction<State['currentDocumentId']> ) {
				state.currentDocumentId = action.payload;
			},

			addDocument( state, action: PayloadAction<Document> ) {
				state.documents[ action.payload.id ] = action.payload;
			},

			updateDocument( state, action: PayloadAction<PartialDocument> ) {
				state.documents[ action.payload.id ] = {
					...state.documents[ action.payload.id ],
					...action.payload,
				};
			},
		},
	} );
}
