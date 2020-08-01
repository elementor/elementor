import router from '@elementor/router';

import Import from './pages/import/import';
import ImportFailed from './pages/import-failed/import-failed';
import ImportContent from './pages/import-content/import-content';
import ImportProcess from './pages/import-process/import-process';
import ImportSuccess from './pages/import-success/import-success';

import Export from './pages/export/export';
import ExportComplete from './pages/export-complete/export-complete';
import ExportPluginsMessage from './pages/export-plugins-message/export-plugins-message';
import ExportPlugins from './pages/export-plugins/export-plugins';

export default class ImportExport {
	routes = [
		{
			path: '/import',
			component: Import,
		},
		{
			path: '/import/failed',
			component: ImportFailed,
		},
		{
			path: '/import/content',
			component: ImportContent,
		},
		{
			path: '/import/process',
			component: ImportProcess,
		},
		{
			path: '/import/success',
			component: ImportSuccess,
		},

		{
			path: '/export',
			component: Export,
		},
		{
			path: '/export/complete',
			component: ExportComplete,
		},
		{
			path: '/export/export-plugins-message',
			component: ExportPluginsMessage,
		},
		{
			path: '/export/export-plugins',
			component: ExportPlugins,
		},
	];

	constructor() {
		for ( const route of this.routes ) {
			router.addRoute( route );
		}
	}
}
