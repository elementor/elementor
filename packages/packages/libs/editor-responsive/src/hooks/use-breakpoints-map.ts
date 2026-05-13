import { useMemo } from 'react';

import { type BreakpointsMap } from '../types';
import { useBreakpoints } from './use-breakpoints';

export function useBreakpointsMap(): BreakpointsMap {
	const breakpoints = useBreakpoints();

	return useMemo( () => {
		const entries = breakpoints.map( ( breakpoint ) => [ breakpoint.id, breakpoint ] );

		return Object.fromEntries( entries );
	}, [ breakpoints ] );
}
