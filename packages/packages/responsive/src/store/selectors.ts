import { Breakpoint, Slice } from '../types';
import { createSelector, SliceState } from '@elementor/store';

type State = SliceState<Slice>;

export const selectEntities = ( state: State ) => state.breakpoints.entities;
export const selectActiveId = ( state: State ) => state.breakpoints.activeId;

export const selectActiveBreakpoint = createSelector(
	selectEntities,
	selectActiveId,
	( entities, activeId ) => activeId && entities[ activeId ]
		? entities[ activeId ]
		: null,
);

export const selectSortedBreakpoints = createSelector(
	selectEntities,
	( entities ) => {
		const bySize = ( a: Breakpoint, b: Breakpoint ) => {
			return ( a.size && b.size ) ? b.size - a.size : 0;
		};

		const all = Object.values( entities );

		const defaults = all.filter( ( breakpoint ) => ! breakpoint.size ); // AKA Desktop.
		const from = all.filter( ( breakpoint ) => breakpoint.type === 'from' );
		const upTo = all.filter( ( breakpoint ) => breakpoint.type === 'up-to' );

		// Sort by size, big to small.
		return [
			...from.sort( bySize ),
			...defaults,
			...upTo.sort( bySize ),
		];
	},
);

