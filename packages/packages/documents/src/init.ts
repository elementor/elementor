import { createSlice } from './store';
import { syncStore } from './sync';
import { injectIntoCanvasDisplay, injectIntoPrimaryAction, registerAction } from '@elementor/top-bar';
import TopBarIndicator from './components/top-bar-indicator';
import TopBarSave from './components/top-bar-save';
import useDocumentPreviewProps from './hooks/use-document-preview-props';

const slice = createSlice();

syncStore( slice );

injectIntoCanvasDisplay( {
	name: 'top-bar-indicator',
	filler: TopBarIndicator,
} );

injectIntoPrimaryAction( {
	name: 'top-bar-save',
	filler: TopBarSave,
} );

registerAction( 'utilities', {
	name: 'top-bar-document-preview',
	useProps: useDocumentPreviewProps,
} );
