import { Slice } from '../types';
import { createSelector, SliceState } from '@elementor/store';

type State = SliceState<Slice>;

const selectDocumentsSlice = ( state: State ) => state.documents;

export const currentDocument = createSelector(
	selectDocumentsSlice,
	( documents ) => documents.entities[ documents.currentId ] || null,
);
