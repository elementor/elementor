import { useMemo } from 'react';
import { useSettingsContext } from '../context/settings-context';
import { isTierAtLeast, TIERS } from '../tiers';

export const TYPE_CONNECT = 'connect';
export const TYPE_PROMOTION = 'promotion';
export const TYPE_APPLY = 'apply';

export default function useKitCallToAction( kitAccessTier ) {
	const { settings } = useSettingsContext();

	// BC: When user has old Pro version which doesn't override the `free` access_tier.
	let userAccessTier = settings.access_tier;
	const isPaidUser = settings.access_level > 0;
	const shouldFallbackToLegacy = isPaidUser && userAccessTier === TIERS.free;

	if ( shouldFallbackToLegacy ) {
		userAccessTier = TIERS.legacy;
	}

	// SubscriptionPlan can be null when the context is not filled (can be happened when using back button in the browser.)
	const subscriptionPlan = useMemo( () => settings.subscription_plans?.[ kitAccessTier ], [ settings, kitAccessTier ] );

	const type = useMemo( () => {
		// The user can apply this kit (the user access level is equal or greater then the kit access level).
		const isAuthorizeToApplyKit = isTierAtLeast( userAccessTier, kitAccessTier );

		// The user in not connected and has pro plugin or the kit is a free kit.
		if ( ! settings.is_library_connected && ( settings.is_pro || isAuthorizeToApplyKit ) ) {
			return TYPE_CONNECT;
		}

		// The user is connected or has only core plugin and cannot access this kit.
		if ( ! isAuthorizeToApplyKit ) {
			return TYPE_PROMOTION;
		}

		// The user is connected and can access the kit.
		return TYPE_APPLY;
	}, [ settings, kitAccessTier ] );

	return [ type, { subscriptionPlan } ];
}
