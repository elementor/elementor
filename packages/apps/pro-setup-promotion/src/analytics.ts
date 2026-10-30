import { getMixpanel } from '@elementor/events';

import {
	CTA_CLICKED_EVENT,
	CTA_TARGET_NAMES,
	PANEL_DISMISSED_EVENT,
	PANEL_VIEWED_EVENT,
	POPOVER_OPENED_EVENT,
	type ProSetupPromotionState,
	STEP_COMPLETED_EVENT,
	TRACKING_LOCATION_L1,
	TRACKING_TARGET_LOCATION,
	TRACKING_WINDOW_NAME,
} from './analytics/constants';

const dispatch = ( eventName: string, payload: Record< string, unknown > ) => {
	getMixpanel().dispatchEvent?.( eventName, {
		window_name: TRACKING_WINDOW_NAME,
		target_location: TRACKING_TARGET_LOCATION,
		location_l1: TRACKING_LOCATION_L1,
		state: payload.state,
		...payload,
	} );
};

const withState = ( state: ProSetupPromotionState, payload: Record< string, unknown > ) => ( {
	state,
	...payload,
} );

/** Banner shown in the widgets panel (APT-105-style funnel). */
export function trackProSetupPromotionImpression( state: ProSetupPromotionState ): void {
	dispatch(
		PANEL_VIEWED_EVENT,
		withState( state, {
			interaction_type: 'view',
			target_type: 'banner',
			target_name: 'pro_setup_panel',
			interaction_result: 'panel_viewed',
		} )
	);
}

/** User opened the setup popover from the banner. */
export function trackProSetupPromotionBannerClick( state: ProSetupPromotionState ): void {
	dispatch(
		POPOVER_OPENED_EVENT,
		withState( state, {
			interaction_type: 'click',
			target_type: 'banner',
			target_name: 'pro_setup_panel',
			interaction_result: 'popover_opened',
		} )
	);
}

/** User dismissed the notice for the cooldown period. */
export function trackProSetupPromotionDismiss( state: ProSetupPromotionState ): void {
	dispatch(
		PANEL_DISMISSED_EVENT,
		withState( state, {
			interaction_type: 'click',
			target_type: 'button',
			target_name: 'dismiss',
			interaction_result: 'panel_dismissed',
		} )
	);
}

/** Primary CTA in the popover (install / activate / connect). */
export function trackProSetupPromotionCtaClick( state: ProSetupPromotionState ): void {
	dispatch(
		CTA_CLICKED_EVENT,
		withState( state, {
			interaction_type: 'click',
			target_type: 'button',
			target_name: CTA_TARGET_NAMES[ state ],
			interaction_result: 'cta_clicked',
		} )
	);
}

export function trackProSetupPromotionResult(
	state: ProSetupPromotionState,
	result: 'success' | 'error',
	action: string,
	errorMessage?: string
): void {
	dispatch(
		STEP_COMPLETED_EVENT,
		withState( state, {
			interaction_type: 'view',
			target_type: 'workflow',
			target_name: 'pro_setup',
			target_value: action,
			interaction_result: 'success' === result ? 'step_completed' : 'step_failed',
			...( errorMessage ? { metadata: { error: errorMessage } } : {} ),
		} )
	);
}

export function trackProSetupPromotionConnectResult( result: 'success' | 'error', errorMessage?: string ): void {
	trackProSetupPromotionResult( 'connect', result, 'connect', errorMessage );
}

export type { ProSetupPromotionState } from './analytics/constants';
