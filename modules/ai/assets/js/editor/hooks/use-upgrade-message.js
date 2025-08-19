import useIntroduction from './use-introduction';

export const USAGE_PERCENTAGE_THRESHOLD = 75;

const useUpgradeMessage = ( { usagePercentage, hasSubscription } ) => {
	const { isViewed: isBannerViewed, markAsViewed: markBannerAsViewed } = useIntroduction( 'e-ai-upgrade-message' );

	const isFreeUser = ! hasSubscription;
	const isBelowThreshold = usagePercentage < USAGE_PERCENTAGE_THRESHOLD;
	const isAboveThreshold = usagePercentage >= USAGE_PERCENTAGE_THRESHOLD;

	const showBadge = isAboveThreshold || isFreeUser;
	const showBanner = ! isBannerViewed && isFreeUser && isBelowThreshold;

	return {
		showBadge,
		showBanner,
		markBannerAsViewed,
	};
};

export default useUpgradeMessage;
