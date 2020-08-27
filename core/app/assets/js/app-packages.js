/**
 * Temporary solution for share components.
 * TODO.
 */

// Make router available for use within packages.
import router from './router';

import * as store from './store.js';

// Alphabetical order.
import appUi from './package';
import siteEditor from '../../modules/site-editor/assets/js/package';

window.elementorAppPackages = {
	appUi,
	router,
	siteEditor,
	store,
};
