import { OnboardingEventTracking } from './onboarding-event-tracking';

/**
 * Checkboxes data.
 */
export const options = [
	{
		plan: 'essential',
		text: __( 'Templates & Theme Builder', 'elementor' ),
	},
	{
		plan: 'advanced',
		text: __( 'WooCommerce Builder', 'elementor' ),
	},
	{
		plan: 'essential',
		text: __( 'Lead Collection & Form Builder', 'elementor' ),
	},
	{
		plan: 'essential',
		text: __( 'Dynamic Content', 'elementor' ),
	},
	{
		plan: 'advanced',
		text: __( 'Popup Builder', 'elementor' ),
	},
	{
		plan: 'advanced',
		text: __( 'Custom Code & CSS', 'elementor' ),
	},
	{
		plan: 'essential',
		text: __( 'Motion Effects & Animations', 'elementor' ),
	},
	{
		plan: 'advanced',
		text: __( 'Notes & Collaboration', 'elementor' ),
	},
];

/**
 * Set the selected feature list.
 * @param {Object}   param0
 * @param {boolean}  param0.checked
 * @param {string}   param0.id
 * @param {string}   param0.text
 * @param {Object}   param0.selectedFeatures
 * @param {Function} param0.setSelectedFeatures
 */
export const setSelectedFeatureList = ( { checked, id, text, selectedFeatures, setSelectedFeatures } ) => {
	const tier = id.split( '-' )[ 0 ];

	if ( checked ) {
		setSelectedFeatures( {
			...selectedFeatures,
			[ tier ]: [ ...selectedFeatures[ tier ], text ],
		} );
	} else {
		setSelectedFeatures( {
			...selectedFeatures,
			[ tier ]: selectedFeatures[ tier ].filter( ( item ) => item !== text ),
		} );
	}
};

export const safeDispatchEvent = ( eventName, eventData ) => {
	try {
		elementorCommon?.eventsManager?.dispatchEvent?.( eventName, eventData );
	} catch ( error ) {
		// Silently fail - don't let tracking break the user experience
	}
};

const getTrackingExperimentName = ( internalName ) => {
	const experimentNames = elementorAppConfig?.onboarding?.experimentNames || {};
	const experimentId = internalName.replace( 'core_onboarding_experiment', '' );
	return experimentNames[ experimentId ] || internalName;
};

const getActiveExperiment = () => {
	const experimentConfigs = OnboardingEventTracking.getExperimentConfigs();
	
	for ( const experimentId in experimentConfigs ) {
		const config = experimentConfigs[ experimentId ];
		const isEnabled = elementorAppConfig?.onboarding?.[ config.enabledKey ] || false;
		
		if ( isEnabled ) {
			const variant = localStorage.getItem( config.variantKey );
			if ( variant ) {
				return {
					name: getTrackingExperimentName( config.name ),
					variant: variant,
				};
			}
		}
	}
	return null;
};

export const addExperimentTrackingToUrl = ( url ) => {
	if ( ! url || typeof url !== 'string' ) {
		return url;
	}

	const activeExperiment = getActiveExperiment();
	if ( ! activeExperiment ) {
		return url;
	}

	const separator = url.includes( '?' ) ? '&' : '?';
	const trackingParams = `e_na=${encodeURIComponent( activeExperiment.name )}&e_va=${encodeURIComponent( activeExperiment.variant )}`;
	
	return url + separator + trackingParams;
};
