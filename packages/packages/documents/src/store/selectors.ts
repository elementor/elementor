import { Slice } from '../types';
import { createSelector, SliceState } from '@elementor/store';

type State = SliceState<Slice>;

const selectDocumentsSlice = ( state: State ) => state.documents;

export const selectActiveDocument = createSelector(
	selectDocumentsSlice,
	( documents ) => documents.entities[ documents.activeId ] || null,
);
