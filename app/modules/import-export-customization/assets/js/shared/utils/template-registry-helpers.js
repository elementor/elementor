/**
 * Creates a standard getInitialState function for template registry
 * @param {string} exportGroup - The export group to check for ('theme-builder', 'global-widget', 'site-templates', etc.)
 * @param {Object} additionalProps - Additional properties to include in return object
 * @return {Function} getInitialState function
 */
export function createGetInitialState( exportGroup, additionalProps = {} ) {
	return ( data, parentInitialState ) => {
		let isEnabled = parentInitialState;
		const isImport = data.hasOwnProperty( 'uploadedData' );

		if ( isImport ) {
			isEnabled = false;
			const templates = data.uploadedData.manifest.templates;
			const exportGroups = elementorAppConfig?.[ 'import-export-customization' ]?.exportGroups || {};

			for ( const templateId in templates ) {
				const template = templates[ templateId ];
				const templateExportGroup = exportGroups[ template.doc_type ];

				if ( templateExportGroup === exportGroup ) {
					isEnabled = true;
					break;
				}
			}
		}

		return {
			enabled: isEnabled,
			...additionalProps,
		};
	};
}
