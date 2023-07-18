import { addSlice, PayloadAction } from '@elementor/store';
import { Breakpoint, BreakpointId } from '../types';

export type State = {
	entities: Record<BreakpointId, Breakpoint>,
	activeId: BreakpointId | null,
}
const initialState: State = {
	entities: {} as State['entities'],
	activeId: null,
};

export function createSlice() {
	return addSlice( {
		name: 'breakpoints',
		initialState,
		reducers: {
			init( state, action: PayloadAction<{
				entities: Breakpoint[],
				activeId: State['activeId'],
			}> ) {
				state.activeId = action.payload.activeId;
				state.entities = normalizeEntities( action.payload.entities );
			},

			activateBreakpoint( state, action: PayloadAction<BreakpointId> ) {
				if ( state.entities[ action.payload ] ) {
					state.activeId = action.payload;
				}
			},
		},
	} );
}

function normalizeEntities( entities: Breakpoint[] ) {
	return entities.reduce( ( acc, breakpoint ) => {
		return {
			...acc,
			[ breakpoint.id ]: breakpoint,
		};
	}, {} as State['entities'] );
}
