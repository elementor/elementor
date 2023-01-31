import { State, Document } from '../types';
import { addSlice, PayloadAction } from '@elementor/store';

const initialState: State = {
	entities: {},
	activeId: 0,
};

export function createSlice() {
	return addSlice( {
		name: 'documents',
		initialState,
		reducers: {
			loadDocuments( state, action: PayloadAction<State['entities']> ) {
				state.entities = action.payload;
			},

			activateDocument( state, action: PayloadAction<Document> ) {
				state.entities[ action.payload.id ] = action.payload;
				state.activeId = action.payload.id;
			},

			toggleIsSaving( state, action: PayloadAction<Document['isSaving']> ) {
				state.entities[ state.activeId ].isSaving = action.payload;
			},

			toggleIsSavingDraft( state, action: PayloadAction<Document['isSavingDraft']> ) {
				state.entities[ state.activeId ].isSavingDraft = action.payload;
			},

			markAsDirty( state, action: PayloadAction<Document['isDirty']> ) {
				state.entities[ state.activeId ].isDirty = action.payload;
			},
		},
	} );
}

