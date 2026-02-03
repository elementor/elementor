/**
 * Onboarding V2 Initialization
 */

import { __registerSlice } from '@elementor/store';

import { onboardingV2Slice } from './store/slice';

/**
 * Initialize the onboarding v2 module.
 * Registers the Redux slice and sets up event listeners.
 */
export function init(): void {
	// Register the Redux slice
	__registerSlice( onboardingV2Slice );

	// Set up beforeunload handler to detect unexpected exits
	setupUnexpectedExitHandler();
}

/**
 * Set up handler for unexpected exits (browser close, navigation away, etc.)
 * This helps distinguish between user-initiated exits and unexpected ones.
 */
function setupUnexpectedExitHandler(): void {
	let hasUserExited = false;

	// Listen for user-initiated exit events
	window.addEventListener( 'onboarding-v2-user-exit', () => {
		hasUserExited = true;
	} );

	// On page unload, if user hasn't explicitly exited, it's an unexpected exit
	window.addEventListener( 'beforeunload', () => {
		if ( ! hasUserExited ) {
			// We can't make async calls here, but the server will detect
			// the unexpected exit on next load by checking exit_type === null
			// and current_step > 0
		}
	} );
}
