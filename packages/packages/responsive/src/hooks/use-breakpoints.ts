import { useCallback } from 'react';
import { BreakpointId } from '../types';
import { useSelector } from '@elementor/store';
import { runCommand } from '@elementor/v1-adapters';
import { selectActiveBreakpoint, selectSortedBreakpoints } from '../store/selectors';

export default function useBreakpoints() {
	const all = useSelector( selectSortedBreakpoints );
	const active = useSelector( selectActiveBreakpoint );

	const activate = useCallback( ( device: BreakpointId ) => {
		return runCommand( 'panel/change-device-mode', {
			device,
		} );
	}, [] );

	return {
		all,
		active,
		activate,
	};
}
