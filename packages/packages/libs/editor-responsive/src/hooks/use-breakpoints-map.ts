import { type BreakpointsMap } from '../types';
import { useBreakpoints } from './use-breakpoints';

export function useBreakpointsMap(): BreakpointsMap {
	const breakpoints = useBreakpoints();

	const entries = breakpoints.map( ( breakpoint ) => [ breakpoint.id, breakpoint ] );

	return Object.fromEntries( entries );
}
