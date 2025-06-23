import { injectIntoTop } from '@elementor/editor';
import { __registerSlice } from '@elementor/store';

import Panels from './components/internal/panels';
import { slice } from './store';
import { sync } from './sync';

export function init() {
	sync();

	__registerSlice( slice );

	injectIntoTop( { id: 'panels', component: Panels } );
}
