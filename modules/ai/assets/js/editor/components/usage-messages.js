import UpgradeBanner from './upgrade-banner';
import UsageLimitAlert from './usage-limit-alert';

const UsageMessages = ( { showBanner, markBannerAsViewed, hasSubscription, usagePercentage, sx } ) => {
	return (
		<>
			{ showBanner && <UpgradeBanner onClose={ markBannerAsViewed } sx={ sx } /> }
			<UsageLimitAlert hasSubscription={ hasSubscription } usagePercentage={ usagePercentage } sx={ sx } />
		</>
	);
};

UsageMessages.propTypes = {
	showBanner: PropTypes.bool,
	markBannerAsViewed: PropTypes.func,
	hasSubscription: PropTypes.bool,
	usagePercentage: PropTypes.number,
	sx: PropTypes.object,
};

export default UsageMessages;
