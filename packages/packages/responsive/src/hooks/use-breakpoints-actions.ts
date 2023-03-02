import { useCallback } from 'react';
import { BreakpointId } from '../types';
import { runCommand } from '@elementor/v1-adapters';

export default function useBreakpointsActions() {
	const activate = useCallback( ( device: BreakpointId ) => {
		return runCommand( 'panel/change-device-mode', { device } );
	}, [] );

	return {
		activate,
	};
}
