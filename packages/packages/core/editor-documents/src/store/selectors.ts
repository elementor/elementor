import { __createSelector, type SliceState } from '@elementor/store';

import { type slice } from './index';

type State = SliceState< typeof slice >;

const selectEntities = ( state: State ) => state.documents.entities;
const selectActiveId = ( state: State ) => state.documents.activeId;
const selectHostId = ( state: State ) => state.documents.hostId;

export const selectActiveDocument = __createSelector( selectEntities, selectActiveId, ( entities, activeId ) =>
	activeId && entities[ activeId ] ? entities[ activeId ] : null
);

export const selectHostDocument = __createSelector( selectEntities, selectHostId, ( entities, hostId ) =>
	hostId && entities[ hostId ] ? entities[ hostId ] : null
);
