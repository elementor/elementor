import router from '@elementor/router';

import Export from './export';
import Import from './import';
import { registerGlobalCustomizationDialogs } from './shared/registry/customization-dialogs';

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
		registerGlobalCustomizationDialogs();

		for ( const route of this.routes ) {
			router.addRoute( route );
		}
	}
}
