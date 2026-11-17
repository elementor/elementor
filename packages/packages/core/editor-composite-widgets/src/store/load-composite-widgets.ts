import { __dispatch as dispatch } from '@elementor/store';

import { apiClient } from '../api';
import { slice } from './store';

export async function loadCompositeWidgets() {
	const definitions = await apiClient.getDefinitions();

	dispatch( slice.actions.load( definitions ) );
}
