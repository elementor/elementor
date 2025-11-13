import { __createAsyncThunk as createAsyncThunk } from '@elementor/store';

import { apiClient } from '../api';

const loadComponents = createAsyncThunk( 'components/load', async () => {
	const response = await apiClient.get();
	return response;
} );

export { loadComponents };
