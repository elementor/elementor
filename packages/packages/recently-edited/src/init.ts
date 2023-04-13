import RecentlyEdited from './components/top-bar/recently-edited';
import { injectIntoCanvasDisplay } from '@elementor/top-bar';

export default function init() {
	registerTopBarMenuItems();
}

function registerTopBarMenuItems() {
	injectIntoCanvasDisplay( {
		name: 'document-recently-edited',
		filler: RecentlyEdited,
	} );
}
