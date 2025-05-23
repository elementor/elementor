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
		const byWidth = ( a: Breakpoint, b: Breakpoint ) => {
			return ( a.width && b.width ) ? b.width - a.width : 0;
		};

		const all = Object.values( entities );

		const defaults = all.filter( ( breakpoint ) => ! breakpoint.width ); // AKA Desktop.
		const minWidth = all.filter( ( breakpoint ) => breakpoint.type === 'min-width' );
		const maxWidth = all.filter( ( breakpoint ) => breakpoint.type === 'max-width' );

		// Sort by size, big to small.
		return [
			...minWidth.sort( byWidth ),
			...defaults,
			...maxWidth.sort( byWidth ),
		];
	},
);
