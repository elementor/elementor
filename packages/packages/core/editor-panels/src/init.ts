import { injectIntoTop } from '@elementor/editor';
import { __registerPanel } from '@elementor/editor-panels';
import { __registerSlice } from '@elementor/store';

import { aiWidgetsPanel } from './components/external/ai-widgets-panel';
import Panels from './components/internal/panels';
import { slice } from './store';
import { sync } from './sync';

console.log( '11111', 11111 );
export function init() {
	sync();

	__registerSlice( slice );

	injectIntoTop( { id: 'panels', component: Panels } );

	// Register AI Widgets Panel (with hooks)
	__registerPanel(aiWidgetsPanel);
}
