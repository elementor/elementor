import { trackEvent } from '@elementor/events';

export const ONBOARDING_ERRORS = {
	CHOICES_PERSIST_FAILED: 'choices_persist_failed',
	THEME_INSTALL_FAILED: 'theme_install_failed',
	PRO_INSTALL_FAILED: 'pro_install_failed',
} as const;

type OnboardingErrorType = ( typeof ONBOARDING_ERRORS )[ keyof typeof ONBOARDING_ERRORS ];

export function trackOnboardingError( errorType: OnboardingErrorType, details?: Record< string, unknown > ) {
	trackEvent( {
		eventName: 'onboarding/error',
		error_type: errorType,
		...details,
	} );
}
