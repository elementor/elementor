import { type Breakpoint, type BreakpointNode } from '../types';
import { getBreakpointsByWidths } from './utils/get-breakpoints-by-widths';

export function getBreakpointsTree(): BreakpointNode {
	const { minWidth, defaults, maxWidth } = getBreakpointsByWidths();

	const [ rootBreakpoint ] = defaults;

	const rootNode: BreakpointNode = {
		...rootBreakpoint,
		children: [],
	};

	// gets an array of breakpoints and nest one in the prior breakpoint
	const buildBranch = ( breakpoints: Breakpoint[] ) => {
		let last: BreakpointNode = rootNode;

		breakpoints.forEach( ( breakpoint ) => {
			const newNode = {
				...breakpoint,
				children: [],
			};

			last.children.push( newNode );

			last = newNode;
		} );
	};

	buildBranch( minWidth );
	buildBranch( maxWidth );

	return rootNode;
}
