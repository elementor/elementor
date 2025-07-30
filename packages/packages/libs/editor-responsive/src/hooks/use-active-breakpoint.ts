import { __privateUseListenTo as useListenTo, windowEvent } from '@elementor/editor-v1-adapters';

import { type BreakpointId, type ExtendedWindow } from '../types';

export function useActiveBreakpoint(): BreakpointId | null {
	return useListenTo( windowEvent( 'elementor/device-mode/change' ), getActiveBreakpoint );
}

function getActiveBreakpoint() {
	const extendedWindow = window as unknown as ExtendedWindow;

	return extendedWindow.elementor?.channels?.deviceMode?.request?.( 'currentMode' ) || null;
}
