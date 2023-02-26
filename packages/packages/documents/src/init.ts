import { createSlice } from './store';
import { syncStore } from './sync';
import { injectIntoCanvasDisplay, injectIntoPrimaryAction, registerAction } from '@elementor/top-bar';
import CanvasDisplay from './components/top-bar/canvas-display';
import useDocumentPreviewProps from './hooks/use-document-preview-props';
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
		name: 'document-primary-action',
		filler: PrimaryAction,
	} );

	registerAction( 'utilities', {
		name: 'document-preview-button',
		priority: 30,
		useProps: useDocumentPreviewProps,
	} );
}
