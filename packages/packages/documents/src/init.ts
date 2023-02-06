import { createSlice } from './store';
import { syncStore } from './sync';
import { injectIntoCanvasDisplay, injectIntoPrimaryAction } from '@elementor/top-bar';
import TopBarIndicator from './components/top-bar-indicator';
import PrimaryAction from './components/top-bar/primary-action';

const slice = createSlice();

syncStore( slice );

injectIntoCanvasDisplay( {
	name: 'top-bar-indicator',
	filler: TopBarIndicator,
} );

injectIntoPrimaryAction( {
	name: 'top-bar-document-primary-action',
	filler: PrimaryAction,
} );
