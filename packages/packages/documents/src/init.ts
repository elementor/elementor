import { createSlice } from './store';
import { syncStore } from './sync';
import { injectIntoCanvasDisplay, injectIntoPrimaryAction, registerAction } from '@elementor/top-bar';
import TopBarIndicator from './components/top-bar-indicator';
import useDocumentPreviewProps from './hooks/use-document-preview-props';
import PrimaryAction from './components/top-bar/primary-action';

const slice = createSlice();

syncStore( slice );

injectIntoCanvasDisplay( {
	name: 'top-bar-indicator',
	filler: TopBarIndicator,
} );

injectIntoPrimaryAction( {
	name: 'top-bar-primary-action',
	filler: PrimaryAction,
} );

registerAction( 'utilities', {
	name: 'top-bar-document-preview',
	useProps: useDocumentPreviewProps,
} );
