
import { Alert, AlertTitle, Button } from '@elementor/ui';

const UpgradeButton = ( props ) => <Button color="inherit" { ...props }>{ __( 'Upgrade', 'elementor' ) }</Button>;

const UsageAlert = ( { title, actionUrl, ...props } ) => {
	return (
		<Alert
			severity="warning"
			action={ <UpgradeButton onClick={ () => window.open( actionUrl, '_blank' ) } /> }
			{ ...props }
		>
			<AlertTitle>{ title }</AlertTitle>
			{ __( 'Get maximum access.', 'elementor' ) }
		</Alert>
	);
};

UsageAlert.propTypes = {
	title: PropTypes.string.isRequired,
	actionUrl: PropTypes.string.isRequired,
};

const UsageLimitAlert = ( { onClose, usagePercentage = 0, hasSubscription, ...props } ) => {
	let actionUrl = 'https://go.elementor.com/ai-popup-purchase-dropdown/';

	if ( hasSubscription ) {
		actionUrl = usagePercentage < 100 ? 'https://go.elementor.com/ai-popup-upgrade-limit-reached-80-percent/' : 'https://go.elementor.com/ai-popup-upgrade-limit-reached/';
	}

	if ( usagePercentage >= 95 ) {
		const alertTitle = hasSubscription
			? __( 'You’ve used over 95% of your Elementor AI plan.', 'elementor' )
			: __( 'You’ve used over 95% of the free trial.', 'elementor' );

		return <UsageAlert title={ alertTitle } actionUrl={ actionUrl } color="error" { ...props } />;
	}

	if ( usagePercentage >= 80 ) {
		const alertTitle = hasSubscription
			? __( 'You’ve used over 80% of your Elementor AI plan.', 'elementor' )
			: __( 'You’ve used over 80% of the free trial.', 'elementor' );

		return <UsageAlert title={ alertTitle } actionUrl={ actionUrl } { ...props } />;
	}

	return null;
};

UsageLimitAlert.propTypes = {
	onClose: PropTypes.func,
	usagePercentage: PropTypes.number,
	hasSubscription: PropTypes.bool,
};

export default UsageLimitAlert;
