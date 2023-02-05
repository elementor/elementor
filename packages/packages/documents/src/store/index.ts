import { Document } from '../types';
import { addSlice, PayloadAction } from '@elementor/store';

type State = {
	entities: Record<Document['id'], Document>,
	activeId: Document['id'] | null, // The currently editing document.
	hostId: Document['id'] | null, // The document that host all the other documents.
}

const initialState: State = {
	entities: {},
	activeId: null,
	hostId: null,
};

const createActiveDocumentReducer = (
	callback: ( document: Document ) => void
) => {
	return ( state: State ) => {
		if ( ! state.activeId ) {
			return;
		}

		callback( state.entities[ state.activeId ] );
	};
};

export function createSlice() {
	return addSlice( {
		name: 'documents',
		initialState,
		reducers: {
			init( state, { payload } : PayloadAction<{
				entities: State['entities'],
				hostId: State['hostId'],
				activeId: State['activeId'] }>
			) {
				state.entities = payload.entities;
				state.hostId = payload.hostId;
				state.activeId = payload.activeId;
			},

			activateDocument( state, action: PayloadAction<Document> ) {
				state.entities[ action.payload.id ] = action.payload;
				state.activeId = action.payload.id;
			},

			startSaving: createActiveDocumentReducer( ( document ) => document.isSaving = true ),
			endSaving( state, action: PayloadAction<Document> ) {
				if ( ! state.activeId ) {
					return;
				}

				state.entities[ state.activeId ] = action.payload;
				state.entities[ state.activeId ].isSaving = false;
			},

			startSavingDraft: createActiveDocumentReducer( ( document ) => document.isSavingDraft = true ),
			endSavingDraft( state, action: PayloadAction<Document> ) {
				if ( ! state.activeId ) {
					return;
				}

				state.entities[ state.activeId ] = action.payload;
				state.entities[ state.activeId ].isSavingDraft = false;
			},

			markAsDirty: createActiveDocumentReducer( ( document ) => document.isDirty = true ),
			markAsPristine: createActiveDocumentReducer( ( document ) => document.isDirty = false ),
		},
	} );
}

