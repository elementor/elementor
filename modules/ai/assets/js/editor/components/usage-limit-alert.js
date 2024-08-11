import { Alert, AlertTitle, Button } from '@elementor/ui';
import { FREE_TRIAL_FEATURES_NAMES } from '../helpers/features-enum';

const KEY_SUBSCRIPTION = 'subscription';
const KEY_NO_SUBSCRIPTION = 'noSubscription';

const getUsageTitle = ( percentage ) => {
	// Translators: %s refers to the credits percentage usage
	return sprintf( __( 'You’ve used %s of credits for this AI feature.', 'elementor' ), percentage );
};

const CREDITS_95_USAGE_TITLE = getUsageTitle( '95%' );
const CREDITS_80_USAGE_TITLE = getUsageTitle( '80%' );
const CREDITS_75_USAGE_TITLE = getUsageTitle( '75%' );

const DESCRIPTION_SUBSCRIPTION = __( 'Get maximum access.', 'elementor' );
const FEATURES = Object.keys( FREE_TRIAL_FEATURES_NAMES );

const getDescriptionNoSubscription = ( excludedFeature ) => {
	const filteredFeatures = FEATURES.filter( ( feature ) => feature !== excludedFeature );
	const featuresList = filteredFeatures.map( ( feature ) => FREE_TRIAL_FEATURES_NAMES[ feature ] ).join( ', ' );
	// Translators: %s refers to the list of remaining features
	return sprintf( __( 'Upgrade now to keep using this feature. You still have credits for other AI features (%s, etc.)',
		'elementor' ), featuresList );
};

const alertConfigs = [
	{
		threshold: 95,
		title: {
			[ KEY_SUBSCRIPTION ]: CREDITS_95_USAGE_TITLE,
			[ KEY_NO_SUBSCRIPTION ]: CREDITS_95_USAGE_TITLE,
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

const UsageLimitAlert = ( { onClose, usagePercentage, hasSubscription, feature, ...props } ) => {
	const config = alertConfigs.find( ( { threshold } ) => usagePercentage >= threshold );

	if ( ! config ) {
		return null;
	}

	const subscriptionType = hasSubscription ? KEY_SUBSCRIPTION : KEY_NO_SUBSCRIPTION;
	const description = {
		[ KEY_SUBSCRIPTION ]: DESCRIPTION_SUBSCRIPTION,
		[ KEY_NO_SUBSCRIPTION ]: getDescriptionNoSubscription( feature ),
	};
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
			{ description[ subscriptionType ] }
		</Alert>
	);
};

UsageLimitAlert.propTypes = {
	onClose: PropTypes.func,
	usagePercentage: PropTypes.number,
	hasSubscription: PropTypes.bool,
	feature: PropTypes.string,
};

export default UsageLimitAlert;
