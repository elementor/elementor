import { __createAsyncThunk as createAsyncThunk } from '@elementor/store';

import { apiClient, type CreateComponentPayload, type CreateComponentResponse } from '../api';

const createComponent = createAsyncThunk< CreateComponentResponse, CreateComponentPayload >(
	'components/create',
	async ( payload: CreateComponentPayload ) => {
		const response = await apiClient.create( payload );
		return { ...response, name: payload.name };
	}
);

const loadComponents = createAsyncThunk( 'components/load', async () => {
	const response = await apiClient.get();
	return response;
} );

export { createComponent, loadComponents };
