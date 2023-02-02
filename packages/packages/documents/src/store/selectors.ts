import { Slice } from '../types';
import { createSelector, SliceState } from '@elementor/store';

type State = SliceState<Slice>;

const selectEntities = ( state: State ) => state.documents.entities;
const selectActiveId = ( state: State ) => state.documents.activeId;
const selectHostId = ( state: State ) => state.documents.hostId;

export const selectActiveDocument = createSelector(
	selectEntities,
	selectActiveId,
	( entities, activeId ) => {
		if ( ! activeId ) {
			return null;
		}

		return entities[ activeId ];
	},
);

export const selectHostDocument = createSelector(
	selectEntities,
	selectHostId,
	( entities, hostId ) => {
		if ( ! hostId ) {
			return null;
		}

		return entities[ hostId ];
	}
);
