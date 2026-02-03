import { __registerSlice } from '@elementor/store';

import { onboardingSlice } from './store/slice';

export function init(): void {
	__registerSlice( onboardingSlice );
	setupUnexpectedExitHandler();
}

function setupUnexpectedExitHandler(): void {
	let hasUserExited = false;

	window.addEventListener( 'onboarding-user-exit', () => {
		hasUserExited = true;
	} );

	// On page unload, if user hasn't explicitly exited, the server will detect
	// the unexpected exit on next load by checking exit_type === null and current_step > 0
	window.addEventListener( 'beforeunload', () => {
		if ( ! hasUserExited ) {
			// Server-side detection handles this case
		}
	} );
}
