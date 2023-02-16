import { createSlice } from './store';
import { syncStore } from './sync';
import { injectIntoCanvasDisplay, injectIntoPrimaryAction, registerAction } from '@elementor/top-bar';
import CanvasDisplay from './components/top-bar/canvas-display';
import useDocumentPreviewProps from './hooks/use-document-preview-props';
import TopBarPrimaryAction from './components/top-bar/primary-action';
import SiteSettingsPrimaryAction from './components/site-settings/ported-primary-action';

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
		name: 'top-bar-primary-action',
		filler: TopBarPrimaryAction,
	} );

	injectIntoPrimaryAction( {
		name: 'site-settings-primary-action-portal',
		filler: SiteSettingsPrimaryAction,
	} );

	registerAction( 'utilities', {
		name: 'document-preview-button',
		useProps: useDocumentPreviewProps,
	} );
}
