import useIntroduction from './use-introduction';

export const USAGE_PERCENTAGE_THRESHOLD = 80;

const useUpgradeMessage = ( { usagePercentage, hasSubscription } ) => {
	const { isViewed, markAsViewed } = useIntroduction( 'e-ai-upgrade-message' );
	const showBadge = usagePercentage >= USAGE_PERCENTAGE_THRESHOLD || ( ! hasSubscription && isViewed );
	const showBanner = usagePercentage < USAGE_PERCENTAGE_THRESHOLD && ! hasSubscription && ! isViewed;

	return {
		showBadge,
		showBanner,
		markBannerAsViewed: markAsViewed,
	};
};

export default useUpgradeMessage;
