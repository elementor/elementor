import { __dispatch as dispatch } from '@elementor/store';

import { apiClient } from './api';
import { slice } from './store';

export async function loadDefaultStyles() {
	const response = await apiClient.all();

	const items = response.data.data;

	dispatch(
		slice.actions.load({
			data: items,
		})
	);
}
