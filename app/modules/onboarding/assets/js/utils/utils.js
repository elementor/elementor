import { OnboardingEventTracking } from './onboarding-event-tracking';

/**
 * Checkboxes data.
 */
const optionsWithoutOne = [
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
 * Updated checkboxes data with ONE features (when editor_one is active).
 * Order matches Figma design: 2 columns, 4 rows
 * Row 1: Theme Builder | AI for code, images, & layouts
 * Row 2: Lead Collection | Optimized images
 * Row 3: Custom Code & CSS | AI or guided accessibility fixes
 * Row 4: Email deliverability | WooCommerce Builder
 */
const optionsWithOne = [
	{
		plan: 'essential',
		text: __( 'Theme Builder', 'elementor' ),
	},
	{
		plan: 'one',
		text: __( 'AI for code, images, & layouts', 'elementor' ),
	},
	{
		plan: 'essential',
		text: __( 'Lead Collection', 'elementor' ),
	},
	{
		plan: 'one',
		text: __( 'Optimized images', 'elementor' ),
	},
	{
		plan: 'advanced',
		text: __( 'Custom Code & CSS', 'elementor' ),
	},
	{
		plan: 'one',
		text: __( 'AI or guided accessibility fixes', 'elementor' ),
	},
	{
		plan: 'one',
		text: __( 'Email deliverability', 'elementor' ),
	},
	{
		plan: 'advanced',
		text: __( 'WooCommerce Builder', 'elementor' ),
	},
];

/**
 * Get checkboxes data based on editor_one feature status.
 * @param {boolean} isEditorOneActive - Whether editor_one feature is active.
 * @return {Array} Array of feature options.
 */
export const getOptions = ( isEditorOneActive = false ) => {
	return isEditorOneActive ? optionsWithOne : optionsWithoutOne;
};

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
					variant,
				};
			}
		}
	}
	return null;
};

export const addExperimentTrackingToUrl = ( url, buttonName = null ) => {
	if ( ! url || typeof url !== 'string' ) {
		return url;
	}

	const activeExperiment = getActiveExperiment();
	if ( ! activeExperiment ) {
		return url;
	}

	const separator = url.includes( '?' ) ? '&' : '?';
	let trackingParams = `e_na=${ encodeURIComponent( activeExperiment.name ) }&e_va=${ encodeURIComponent( activeExperiment.variant ) }`;

	if ( buttonName ) {
		trackingParams += `&e_bu=${ encodeURIComponent( buttonName ) }`;
	}

	return url + separator + trackingParams;
};
