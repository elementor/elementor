import { State } from '../types';
import { addSlice } from '@elementor/store';

const initialState: State = {
	documents: {},
	currentDocumentId: 0,
};

export const slice = addSlice( {
	name: 'documents',
	initialState,
	reducers: {
		// TODO: Zod on everything?
		setDocuments( state, action ) {
			state.documents = action.payload;
		},
		setCurrentDocumentId( state, action ) {
			state.currentDocumentId = action.payload;
		},
		addDocument( state, action ) {
			state.documents[ action.payload.id ] = action.payload;
		},
		updateDocument( state, action ) {
			state.documents[ action.payload.id ] = {
				...state.documents[ action.payload.id ],
				...action.payload,
			};
		},
	},
} );
