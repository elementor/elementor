import { createModule } from '@elementor/store';

import slice, { initialState } from './slice';
import actions from './actions';

export default createModule( {
	slice,
	initialState,
	actions,
} );
