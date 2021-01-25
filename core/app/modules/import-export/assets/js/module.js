import router from '@elementor/router';

import Import from './import';
import Export from './export';

export default class ImportExport {
	routes = [
		{
			path: '/import/*',
			component: Import,
		},
		{
			path: '/export/*',
			component: Export,
		},
	];

	constructor() {
		for ( const route of this.routes ) {
			router.addRoute( route );
		}
	}
}
