import { Alert, AlertTitle, Button } from '@elementor/ui';

const KEY_SUBSCRIPTION = 'subscription';
const KEY_NO_SUBSCRIPTION = 'noSubscription';

const alertConfigs = [
	{
		threshold: 95,
		title: {
			[ KEY_SUBSCRIPTION ]: __( 'You’ve used over 95% of your Elementor AI plan.', 'elementor' ),
			[ KEY_NO_SUBSCRIPTION ]: __( 'You’ve used over 95% of the free trial.', 'elementor' ),
		},
		url: {
			[ KEY_SUBSCRIPTION ]: 'https://go.elementor.com/ai-banner-paid-95-limit-reach/',
			[ KEY_NO_SUBSCRIPTION ]: 'https://go.elementor.com/ai-banner-free-95-limit-reach/',
		},
		color: 'error',
	},
	{
		threshold: 80,
		title: {
			[ KEY_SUBSCRIPTION ]: __( 'You’ve used over 80% of your Elementor AI plan.', 'elementor' ),
			[ KEY_NO_SUBSCRIPTION ]: __( 'You’ve used over 80% of the free trial.', 'elementor' ),
		},
		url: {
			[ KEY_SUBSCRIPTION ]: 'https://go.elementor.com/ai-banner-paid-80-limit-reach/',
			[ KEY_NO_SUBSCRIPTION ]: 'https://go.elementor.com/ai-banner-free-80-limit-reach/',
		},
		color: 'warning',
	},
];

const UpgradeButton = ( props ) => <Button color="inherit" { ...props }>{ __( 'Upgrade', 'elementor' ) }</Button>;

const UsageLimitAlert = ( { onClose, usagePercentage, hasSubscription, ...props } ) => {
	const config = alertConfigs.find( ( { threshold } ) => usagePercentage >= threshold );

	if ( ! config ) {
		return null;
	}

	const subscriptionType = hasSubscription ? KEY_SUBSCRIPTION : KEY_NO_SUBSCRIPTION;
	const { title, url, color } = config;
	const handleUpgradeClick = () => window.open( url[ subscriptionType ], '_blank' );

	return (
		<Alert
			severity="warning"
			action={ <UpgradeButton onClick={ handleUpgradeClick } /> }
			color={ color }
			{ ...props }
		>
			<AlertTitle>{ title[ subscriptionType ] }</AlertTitle>
			{ __( 'Get maximum access.', 'elementor' ) }
		</Alert>
	);
};

UsageLimitAlert.propTypes = {
	onClose: PropTypes.func,
	usagePercentage: PropTypes.number,
	hasSubscription: PropTypes.bool,
};

export default UsageLimitAlert;
