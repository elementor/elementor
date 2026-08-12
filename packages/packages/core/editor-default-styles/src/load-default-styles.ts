import { __dispatch as dispatch } from '@elementor/store';

import { apiClient } from './api';
import { slice } from './store';

export async function loadDefaultStyles() {
	const [ previewResponse, frontendResponse ] = await Promise.all( [
		apiClient.all( 'preview' ),
		apiClient.all( 'frontend' ),
	] );

	const previewItems = previewResponse.data.data;
	const frontendItems = frontendResponse.data.data;

	dispatch(
		slice.actions.load( {
			preview: previewItems,
			frontend: frontendItems,
		} )
	);
}
