import router from '@elementor/router';

import Export from './export';
import Import from './import';

export default class ImportExportCustomization {
	routes = [
		{
			path: '/export/*',
			component: Export,
		},
		{
			path: '/import/*',
			component: Import,
		},
	];

	constructor() {
		for ( const route of this.routes ) {
			router.addRoute( route );
		}
	}
}
