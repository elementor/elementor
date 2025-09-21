import { __createAsyncThunk as createAsyncThunk } from '@elementor/store';

import { apiClient } from '../api';

export default createAsyncThunk( 'components/load', async () => {
	const response = await apiClient.get();
	return response;
} );
