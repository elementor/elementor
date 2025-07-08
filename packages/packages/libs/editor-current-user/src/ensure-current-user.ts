import { registerDataHook } from '@elementor/editor-v1-adapters';
import { type QueryClient } from '@elementor/query';

import { getCurrentUser } from './get-current-user';
import { EDITOR_CURRENT_USER_QUERY_KEY } from './use-current-user';

export function ensureCurrentUser( { queryClient }: { queryClient: QueryClient } ) {
	registerDataHook( 'after', 'editor/documents/attach-preview', async () => {
		try {
			await queryClient.ensureQueryData( {
				queryKey: [ EDITOR_CURRENT_USER_QUERY_KEY ],
				queryFn: getCurrentUser,
				retry: false,
			} );
		} catch {
			queryClient.setQueryData( [ EDITOR_CURRENT_USER_QUERY_KEY ], null );
		}
	} );

	return queryClient.getQueryData( [ EDITOR_CURRENT_USER_QUERY_KEY ] );
}
