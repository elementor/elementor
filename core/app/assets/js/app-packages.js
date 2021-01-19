/**
 * Temporary solution for share components.
 * TODO.
 */

// Make router available for use within packages.
import router from './router';

// Alphabetical order.
import appUi from './package';
import siteEditor from '../../modules/site-editor/assets/js/package';
import importExport from '../../modules/import-export/assets/js/package';

window.elementorAppPackages = {
	appUi,
	router,
	siteEditor,
	importExport,
};
