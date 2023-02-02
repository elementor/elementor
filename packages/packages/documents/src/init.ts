import { createSlice } from './store';
import { syncStore } from './sync';
import { injectIntoCanvasDisplay, injectIntoPrimaryAction } from '@elementor/top-bar';
import CanvasDisplay from './components/top-bar/canvas-display';
import PrimaryAction from './components/top-bar/primary-action';

export default function init() {
	initStore();
	registerTopBarMenuItems();
}

function initStore() {
	const slice = createSlice();

	syncStore( slice );
}

function registerTopBarMenuItems() {
	injectIntoCanvasDisplay( {
		name: 'documents-canvas-display',
		filler: CanvasDisplay,
	} );

	injectIntoPrimaryAction( {
		name: 'top-bar-save',
		filler: PrimaryAction,
	} );
}
