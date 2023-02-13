import { createSlice } from './store';
import { syncStore } from './sync';
import { injectIntoCanvasDisplay, injectIntoPrimaryAction } from '@elementor/top-bar';
import TopBarIndicator from './components/top-bar-indicator';
import TopBarPrimaryAction from './components/top-bar/primary-action';
import SiteSettingsPrimaryAction from './components/site-settings/ported-primary-action';

const slice = createSlice();

syncStore( slice );

injectIntoCanvasDisplay( {
	name: 'top-bar-indicator',
	filler: TopBarIndicator,
} );

injectIntoPrimaryAction( {
	name: 'top-bar-primary-action',
	filler: TopBarPrimaryAction,
} );

injectIntoPrimaryAction( {
	name: 'site-settings-primary-action-portal',
	filler: SiteSettingsPrimaryAction,
} );
