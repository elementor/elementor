import { __createAsyncThunk as createAsyncThunk } from '@elementor/store';

import { apiClient, type CreateComponentPayload, type CreateComponentResponse } from '../api';

export default createAsyncThunk< CreateComponentResponse, CreateComponentPayload >(
	'components/create',
	async ( payload ) => {
		const response = await apiClient.create( payload );
		return { ...response, name: payload.name };
	}
);
