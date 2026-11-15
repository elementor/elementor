import { injectIntoTop } from '@elementor/editor';

import Sidebar from './components/sidebar';

export function init() {
	injectIntoTop( { id: 'editor-sidebar', component: Sidebar } );
}
