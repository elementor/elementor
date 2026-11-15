import { injectIntoTop } from '@elementor/editor';

import Sidebar from './components/sidebar';
import { isSidebarEnabled } from './gate';

export function init() {
	if ( ! isSidebarEnabled() ) {
		return;
	}

	injectIntoTop( { id: 'editor-sidebar', component: Sidebar } );
}
