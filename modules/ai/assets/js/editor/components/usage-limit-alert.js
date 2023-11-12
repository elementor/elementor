
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

const UsageLimitAlert = ( { onClose, usagePercentage = 0, hasSubscription, ...props } ) => {
	for ( const config of alertConfigs ) {
		if ( usagePercentage >= config.threshold ) {
			const subscriptionType = hasSubscription ? KEY_SUBSCRIPTION : KEY_NO_SUBSCRIPTION;
			const { title, url, color } = config;

			return (
				<Alert
					severity="warning"
					action={ <UpgradeButton onClick={ () => window.open( url[ subscriptionType ], '_blank' ) } /> }
					color={ color }
					{ ...props }
				>
					<AlertTitle>{ title[ subscriptionType ] }</AlertTitle>
					{ __( 'Get maximum access.', 'elementor' ) }
				</Alert>
			);
		}
	}

	return null;
};

UsageLimitAlert.propTypes = {
	onClose: PropTypes.func,
	usagePercentage: PropTypes.number,
	hasSubscription: PropTypes.bool,
};

export default UsageLimitAlert;
