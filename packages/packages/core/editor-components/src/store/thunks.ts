import { type V1ElementData } from '@elementor/editor-elements';
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

async function loadStyles( ids: number[] ): Promise< [ number, V1ElementData ][] > {
	return Promise.all( ids.map( async ( id ) => [ id, await apiClient.getConfig( id ) ] ) );
}

export { createComponent, loadComponents, loadStyles };
