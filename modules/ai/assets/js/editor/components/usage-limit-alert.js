import { Alert, AlertTitle, Button } from '@elementor/ui';

const KEY_SUBSCRIPTION = 'subscription';
const KEY_NO_SUBSCRIPTION = 'noSubscription';

const getUsageTitle = ( percentage ) => {
	// Translators: %s refers to the credits percentage usage
	return sprintf( __( 'You\'ve used %s of credits for this AI feature.', 'elementor' ), percentage );
};

const CREDITS_95_USAGE_TITLE = getUsageTitle( '95%' );
const CREDITS_80_USAGE_TITLE = getUsageTitle( '80%' );
const CREDITS_75_USAGE_TITLE = getUsageTitle( '75%' );

const DESCRIPTION_SUBSCRIPTION = __( 'Get maximum access.', 'elementor' );
const DESCRIPTION_NO_SUBSCRIPTION = __( 'Upgrade now to keep using this feature. You still have credits for other AI features (Text, Code, Images, Containers, etc.)', 'elementor' );

const alertConfigs = [
	{
		threshold: 95,
		title: {
			[ KEY_SUBSCRIPTION ]: CREDITS_95_USAGE_TITLE,
			[ KEY_NO_SUBSCRIPTION ]: CREDITS_95_USAGE_TITLE,
		},
		description: {
			[ KEY_SUBSCRIPTION ]: DESCRIPTION_SUBSCRIPTION,
			[ KEY_NO_SUBSCRIPTION ]: DESCRIPTION_NO_SUBSCRIPTION,
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
			[ KEY_SUBSCRIPTION ]: CREDITS_80_USAGE_TITLE,
			[ KEY_NO_SUBSCRIPTION ]: CREDITS_80_USAGE_TITLE,
		},
		description: {
			[ KEY_SUBSCRIPTION ]: DESCRIPTION_SUBSCRIPTION,
			[ KEY_NO_SUBSCRIPTION ]: DESCRIPTION_NO_SUBSCRIPTION,
		},
		url: {
			[ KEY_SUBSCRIPTION ]: 'https://go.elementor.com/ai-banner-paid-80-limit-reach/',
			[ KEY_NO_SUBSCRIPTION ]: 'https://go.elementor.com/ai-banner-free-80-limit-reach/',
		},
		color: 'warning',
	},
	{
		threshold: 75,
		title: {
			[ KEY_SUBSCRIPTION ]: CREDITS_75_USAGE_TITLE,
			[ KEY_NO_SUBSCRIPTION ]: CREDITS_75_USAGE_TITLE,
		},
		description: {
			[ KEY_SUBSCRIPTION ]: DESCRIPTION_SUBSCRIPTION,
			[ KEY_NO_SUBSCRIPTION ]: DESCRIPTION_NO_SUBSCRIPTION,
		},
		url: {
			[ KEY_SUBSCRIPTION ]: 'https://go.elementor.com/ai-banner-paid-80-limit-reach/',
			[ KEY_NO_SUBSCRIPTION ]: 'https://go.elementor.com/ai-banner-free-80-limit-reach/',
		},
		color: 'warning',
	},
];

const UpgradeButton = ( props ) => <Button color="inherit" variant="outlined" sx={ { border: '2px solid' } } { ...props }>
	{ __( 'Upgrade now', 'elementor' ) }
</Button>;

const UsageLimitAlert = ( { onClose, usagePercentage, hasSubscription, ...props } ) => {
	const config = alertConfigs.find( ( { threshold } ) => usagePercentage >= threshold );

	if ( ! config ) {
		return null;
	}

	const subscriptionType = hasSubscription ? KEY_SUBSCRIPTION : KEY_NO_SUBSCRIPTION;
	const { title, description, url, color } = config;
	const handleUpgradeClick = () => window.open( url[ subscriptionType ], '_blank' );

	return (
		<Alert
			severity="warning"
			action={ <UpgradeButton onClick={ handleUpgradeClick } /> }
			color={ color }
			{ ...props }
		>
			<AlertTitle>{ title[ subscriptionType ] }</AlertTitle>
			{ description[ subscriptionType ] }
		</Alert>
	);
};

UsageLimitAlert.propTypes = {
	onClose: PropTypes.func,
	usagePercentage: PropTypes.number,
	hasSubscription: PropTypes.bool,
};

export default UsageLimitAlert;
