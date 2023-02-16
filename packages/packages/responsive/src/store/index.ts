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

				// Normalize the breakpoints array to object.
				state.entities = action.payload.entities
					.reduce( ( acc, breakpoint ) => {
						return {
							...acc,
							[ breakpoint.id ]: breakpoint,
						};
					}, {} as State['entities'] );
			},

			activateBreakpoint( state, action: PayloadAction<BreakpointId> ) {
				state.activeId = action.payload;
			},
		},
	} );
}

