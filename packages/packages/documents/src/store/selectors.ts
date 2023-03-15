import type { Slice } from './index';
import { createSelector, SliceState } from '@elementor/store';

type State = SliceState<Slice>;

const selectEntities = ( state: State ) => state.documents.entities;
const selectActiveId = ( state: State ) => state.documents.activeId;
const selectHostId = ( state: State ) => state.documents.hostId;

export const selectActiveDocument = createSelector(
	selectEntities,
	selectActiveId,
	( entities, activeId ) => activeId && entities[ activeId ]
		? entities[ activeId ]
		: null,
);

export const selectHostDocument = createSelector(
	selectEntities,
	selectHostId,
	( entities, hostId ) => hostId && entities[ hostId ]
		? entities[ hostId ]
		: null,
);
