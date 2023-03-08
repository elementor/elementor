import CanvasDisplay from './components/top-bar/canvas-display';
import PrimaryAction from './components/top-bar/primary-action';
import useDocumentPreviewProps from './hooks/use-document-preview-props';
import { injectIntoCanvasDisplay, injectIntoPrimaryAction, utilitiesMenu } from '@elementor/top-bar';

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

	utilitiesMenu.registerAction( {
		name: 'document-preview-button',
		priority: 30, // After help.
		useProps: useDocumentPreviewProps,
	} );
}
