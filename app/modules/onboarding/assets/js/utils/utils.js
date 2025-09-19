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
export const setSelectedFeatureList = ( { checked, id, text, selectedFeatures, setSelectedFeatures } ) => { // eslint-disable-line no-unused-vars
	const tier = id.split( '-' )[ 0 ];

	if ( checked ) {
		setSelectedFeatures( {
			...selectedFeatures,
			[ tier ]: [ ...selectedFeatures[ tier ], id ],
		} );
	} else {
		setSelectedFeatures( {
			...selectedFeatures,
			[ tier ]: selectedFeatures[ tier ].filter( ( item ) => item !== id ),
		} );
	}
};

/**
 * Convert feature keys back to English feature names for reporting.
 * @param {Array} featureKeys - Array of feature keys (e.g., ["essential-0", "advanced-1"])
 * @return {Array} Array of English feature names
 */
export const convertKeysToEnglishNames = ( featureKeys ) => {
	const keyToEnglishNameMap = {
		'essential-0': 'Templates & Theme Builder',
		'advanced-0': 'WooCommerce Builder',
		'essential-1': 'Lead Collection & Form Builder',
		'essential-2': 'Dynamic Content',
		'advanced-1': 'Popup Builder',
		'advanced-2': 'Custom Code & CSS',
		'essential-3': 'Motion Effects & Animations',
		'advanced-3': 'Notes & Collaboration',
	};

	return featureKeys.map( ( key ) => {
		return keyToEnglishNameMap[ key ] || key;
	} );
};

export const safeDispatchEvent = ( eventName, eventData ) => {
	try {
		elementorCommon?.eventsManager?.dispatchEvent?.( eventName, eventData );
	} catch ( error ) {
		// Silently fail - don't let tracking break the user experience
	}
};
