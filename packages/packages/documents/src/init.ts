import { createSlice } from './store';
import { syncStore } from './sync';
import { injectIntoCanvasDisplay, injectIntoPrimaryAction } from '@elementor/top-bar';
import TopBarIndicator from './components/top-bar-indicator';
import TopBarSave from './components/top-bar-save';

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
