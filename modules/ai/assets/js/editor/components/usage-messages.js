import UpgradeBanner from './upgrade-banner';
import UsageLimitAlert from './usage-limit-alert';
import useUpgradeMessage from '../hooks/use-upgrade-message';

const UsageMessages = ( { hasSubscription, usagePercentage, sx, feature } ) => {
	const { showBanner, markBannerAsViewed } = useUpgradeMessage( { usagePercentage, hasSubscription } );

	return (
		<>
			{ showBanner && <UpgradeBanner onClose={ markBannerAsViewed } sx={ sx } /> }
			<UsageLimitAlert hasSubscription={ hasSubscription } usagePercentage={ usagePercentage } sx={ sx } feature={ feature } />
		</>
	);
};

UsageMessages.propTypes = {
	hasSubscription: PropTypes.bool,
	usagePercentage: PropTypes.number,
	sx: PropTypes.object,
	feature: PropTypes.string,
};

export default UsageMessages;
