import CanvasDisplay from './components/top-bar/canvas-display';
import PrimaryAction from './components/top-bar/primary-action';
import useDocumentPreviewProps from './hooks/use-document-preview-props';
import { injectIntoCanvasDisplay, injectIntoPrimaryAction, registerAction } from '@elementor/top-bar';

export default function init() {
	registerTopBarMenuItems();
}

function registerTopBarMenuItems() {
	injectIntoCanvasDisplay( {
		name: 'document-canvas-display',
		filler: CanvasDisplay,
	} );

	injectIntoPrimaryAction( {
		name: 'document-primary-action',
		filler: PrimaryAction,
	} );

	registerAction( 'utilities', {
		name: 'document-preview-button',
		useProps: useDocumentPreviewProps,
	} );
}
