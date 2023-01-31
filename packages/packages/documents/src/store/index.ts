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
			setDocuments( state, action: PayloadAction<State['entities']> ) {
				state.entities = action.payload;
			},

			activateDocument( state, action: PayloadAction<Document> ) {
				state.entities[ action.payload.id ] = action.payload;
				state.activeId = action.payload.id;
			},

			startSaving( state ) {
				state.entities[ state.activeId ].isSaving = true;
			},

			endSaving( state ) {
				state.entities[ state.activeId ].isSaving = false;
			},

			startSavingDraft( state ) {
				state.entities[ state.activeId ].isSavingDraft = true;
			},

			endSavingDraft( state ) {
				state.entities[ state.activeId ].isSavingDraft = false;
			},

			markAsDirty( state ) {
				state.entities[ state.activeId ].isDirty = true;
			},

			markAsPristine( state ) {
				state.entities[ state.activeId ].isDirty = false;
			},
		},
	} );
}

