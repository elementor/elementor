import router from '@elementor/router';

import Export from './export';
import Import from './import';

export default class ImportExportCustomization {
	routes = [
		{
			path: '/export-customization/*',
			component: Export,
		},
		{
			path: '/import-customization/*',
			component: Import,
		},
	];

	constructor() {
		for ( const route of this.routes ) {
			router.addRoute( route );
		}

		this.registerImportExportTemplate();
	}

	registerImportExportTemplate() {
		if ( ! elementorCommon?.config?.experimentalFeatures?.[ 'import-export-customization' ] ) {
			return;
		}

		elementorModules?.importExport?.templateRegistry.register( {
			key: 'siteTemplates',
			exportGroup: 'site-templates',
			title: 'Site Templates',
			order: 0,
			getInitialState: ( data, parentInitialState ) => {
				let isEnabled = parentInitialState;
				const isImport = data.hasOwnProperty( 'uploadedData' );

				if ( isImport ) {
					isEnabled = false;
					const templates = data.uploadedData.manifest.templates;
					const exportGroups = elementorAppConfig?.['import-export-customization']?.exportGroups || {};
					
					for ( const templateId in templates ) {
						const template = templates[ templateId ];
						const exportGroup = exportGroups[ template.doc_type ];
						
						if ( exportGroup === 'site-templates' ) {
							isEnabled = true;
							break;
						}
					}
				}

				return {
					enabled: isEnabled,
				};
			},
		} );
	}
}
