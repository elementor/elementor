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
 * @param {boolean}       checked             - Whether the feature is checked or not.
 * @param {string}        id                  - The ID of the feature.
 * @param {string}        text                - The text associated with the feature.
 * @param {Array<string>} selectedFeatures    - Array of selected features.
 * @param {Function}      setSelectedFeatures - Function to set selected features.
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
