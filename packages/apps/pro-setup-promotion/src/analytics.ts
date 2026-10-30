import {
	type PromotionTrackingData,
	trackUpgradePromotionClick,
	trackViewPromotion,
} from '@elementor/editor-controls';
import { getMixpanel } from '@elementor/events';

export type ProSetupPromotionState = 'install' | 'activate' | 'connect';

const TARGET_NAME = 'pro_setup_panel';

function getTrackingData( state: ProSetupPromotionState ): PromotionTrackingData {
	return {
		target_name: TARGET_NAME,
		target_location: 'widget_panel',
		location_l1: state,
	};
}

function dispatchPromotionEvent(
	state: ProSetupPromotionState,
	eventNameKey: 'viewPromotion' | 'upgradePromotionClick',
	interactionResult: string,
	interactionDescription: string,
	extra: Record< string, unknown > = {}
): void {
	const { dispatchEvent, config } = getMixpanel();
	const eventName =
		'viewPromotion' === eventNameKey
			? config?.names?.promotions?.viewPromotion
			: config?.names?.promotions?.upgradePromotionClick;

	if ( ! eventName ) {
		return;
	}

	dispatchEvent( eventName, {
		window_name: config?.appTypes?.editor ?? 'editor',
		interaction_type: config?.triggers?.click ?? 'Click',
		target_name: TARGET_NAME,
		target_location: 'widget_panel',
		location_l1: state,
		interaction_result: interactionResult,
		interaction_description: interactionDescription,
		...extra,
	} );
}

/** Banner visible in the widgets panel (`view_promotion`). */
export function trackProSetupPromotionImpression( state: ProSetupPromotionState ): void {
	trackViewPromotion( getTrackingData( state ) );
}

/** User opened the setup popover (`view_promotion`). */
export function trackProSetupPromotionBannerClick( state: ProSetupPromotionState ): void {
	dispatchPromotionEvent( state, 'viewPromotion', 'promotion_viewed', 'user_opened_pro_setup_popover' );
}

/** User dismissed the notice (`view_promotion`). */
export function trackProSetupPromotionDismiss( state: ProSetupPromotionState ): void {
	dispatchPromotionEvent( state, 'viewPromotion', 'promotion_dismissed', 'user_dismissed_pro_setup_panel' );
}

/** Primary CTA in the popover (`upgrade_promotion_click`). */
export function trackProSetupPromotionCtaClick( state: ProSetupPromotionState ): void {
	trackUpgradePromotionClick( getTrackingData( state ) );
}

export function trackProSetupPromotionResult(
	state: ProSetupPromotionState,
	result: 'success' | 'error',
	action: string,
	errorMessage?: string
): void {
	dispatchPromotionEvent(
		state,
		'upgradePromotionClick',
		'success' === result ? 'pro_setup_succeeded' : 'pro_setup_failed',
		`pro_setup_${ action }_${ result }`,
		{
			target_value: action,
			...( errorMessage ? { metadata: { error: errorMessage } } : {} ),
		}
	);
}

export function trackProSetupPromotionConnectResult( result: 'success' | 'error', errorMessage?: string ): void {
	trackProSetupPromotionResult( 'connect', result, 'connect', errorMessage );
}
