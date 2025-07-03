import { registerDataHook } from '@elementor/editor-v1-adapters';
import { type QueryClient } from '@elementor/query';

import { apiClient } from './api';
import { EDITOR_CURRENT_USER_QUERY_KEY } from './use-current-user';

export function ensureCurrentUser( { queryClient }: { queryClient: QueryClient } ) {
	registerDataHook( 'after', 'editor/documents/attach-preview', async () => {
		await queryClient.ensureQueryData( {
			queryKey: [ EDITOR_CURRENT_USER_QUERY_KEY ],
			queryFn: apiClient.get,
		} );
	} );

	return queryClient.getQueryData( [ EDITOR_CURRENT_USER_QUERY_KEY ] );
}
