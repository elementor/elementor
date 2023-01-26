import { addSlice } from '@elementor/store';
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
			setDocuments( state, action: { payload: State['documents'] } ) {
				state.documents = action.payload;
			},

			setCurrentDocumentId( state, action: { payload: State['currentDocumentId'] } ) {
				state.currentDocumentId = action.payload;
			},

			addDocument( state, action: { payload: Document } ) {
				state.documents[ action.payload.id ] = action.payload;
			},

			updateDocument( state, action: { payload: PartialDocument } ) {
				state.documents[ action.payload.id ] = {
					...state.documents[ action.payload.id ],
					...action.payload,
				};
			},
		},
	} );
}
