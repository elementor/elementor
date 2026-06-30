import { injectIntoTop } from '@elementor/editor';
import { __registerSlice as registerSlice } from '@elementor/store';

import Wrapper from './components/notifications';
import { notificationsSlice } from './slice';

export function init() {
	registerSlice( notificationsSlice );
	injectIntoTop( {
		id: 'notifications',
		component: Wrapper,
	} );
}
