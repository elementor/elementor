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
