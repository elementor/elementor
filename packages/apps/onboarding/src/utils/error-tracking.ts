import { trackEvent } from '@elementor/events';

export function trackOnboardingError( errorType: string, details?: Record< string, unknown > ) {
	trackEvent( {
		eventName: 'onboarding/error',
		error_type: errorType,
		...details,
	} );
}
