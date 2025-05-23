import { createSlice } from './store';
import syncStore from './sync/sync-store';
import { injectIntoCanvasDisplay } from '@elementor/top-bar';
import BreakpointsSwitcher from './components/breakpoints-switcher';

export default function init() {
	initStore();

	registerTopBarUI();
}

function initStore() {
	const slice = createSlice();

	syncStore( slice );
}

function registerTopBarUI() {
	injectIntoCanvasDisplay( {
		name: 'responsive-breakpoints-switcher',
		filler: BreakpointsSwitcher,
		options: {
			priority: 20, // After document indication.
		},
	} );
}
