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
			title: __( 'Site Templates', 'elementor ' ),
			order: 0,
			getInitialState: elementorModules?.importExport?.createGetInitialState?.( 'site-templates' ),
		} );
	}
}
