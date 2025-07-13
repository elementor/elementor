import router from '@elementor/router';

import Export from './export';

export default class ImportExportCustomization {
	routes = [
		{
			path: '/export-customization/*',
			component: Export,
		},
	];

	constructor() {
		for ( const route of this.routes ) {
			router.addRoute( route );
		}
	}
}
