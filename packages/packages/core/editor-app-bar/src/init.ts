import { injectIntoTop } from '@elementor/editor';

import AppBar from './components/app-bar';
import { init as initExtensions } from './extensions';
import redirectOldMenus from './sync/redirect-old-menus';

export function init() {
	redirectOldMenus();

	initExtensions();

	injectIntoTop( {
		id: 'app-bar',
		component: AppBar,
	} );
}
