import { injectIntoTop } from '@elementor/editor';
import { __registerSlice } from '@elementor/store';

import FloatingPanelsHost from './components/internal/host';
import { slice } from './store/slice';
import { sync } from './sync';

export function init() {
	__registerSlice( slice );
	sync();
	injectIntoTop( { id: 'floating-panels', component: FloatingPanelsHost } );
}
