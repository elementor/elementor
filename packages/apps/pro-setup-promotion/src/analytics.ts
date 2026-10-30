import { trackEvent } from '@elementor/events';

export type ProSetupPromotionState = 'install' | 'activate' | 'connect';

const BASE = 'pro_setup_promotion';

export function trackProSetupPromotionImpression( state: ProSetupPromotionState ): void {
	trackEvent( {
		eventName: `${ BASE }_impression`,
		setup_state: state,
	} );
}

export function trackProSetupPromotionBannerClick( state: ProSetupPromotionState ): void {
	trackEvent( {
		eventName: `${ BASE }_banner_click`,
		setup_state: state,
	} );
}

export function trackProSetupPromotionDismiss( state: ProSetupPromotionState ): void {
	trackEvent( {
		eventName: `${ BASE }_dismiss`,
		setup_state: state,
	} );
}

export function trackProSetupPromotionCtaClick( state: ProSetupPromotionState ): void {
	trackEvent( {
		eventName: `${ BASE }_cta_click`,
		setup_state: state,
	} );
}

export function trackProSetupPromotionResult(
	state: ProSetupPromotionState,
	result: 'success' | 'error',
	action: string,
	errorMessage?: string
): void {
	trackEvent( {
		eventName: `${ BASE }_${ action }_result`,
		setup_state: state,
		result,
		...( errorMessage ? { error_message: errorMessage } : {} ),
	} );
}

export function trackProSetupPromotionConnectResult( result: 'success' | 'error', errorMessage?: string ): void {
	trackProSetupPromotionResult( 'connect', result, 'connect', errorMessage );
}
