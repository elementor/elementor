import UpgradeBanner from './upgrade-banner';
import UsageLimitAlert from './usage-limit-alert';
import useUpgradeMessage from '../hooks/use-upgrade-message';

const UsageMessages = ( { hasSubscription, usagePercentage, sx } ) => {
	const { showBanner, markBannerAsViewed } = useUpgradeMessage( { usagePercentage, hasSubscription } );

	return (
		<>
			{ showBanner && <UpgradeBanner onClose={ markBannerAsViewed } sx={ sx } /> }
			<UsageLimitAlert hasSubscription={ hasSubscription } usagePercentage={ usagePercentage } sx={ sx } />
		</>
	);
};

UsageMessages.propTypes = {
	hasSubscription: PropTypes.bool,
	usagePercentage: PropTypes.number,
	sx: PropTypes.object,
};

export default UsageMessages;
