import { __privateListenTo as listenTo, v1ReadyEvent } from '@elementor/editor-v1-adapters';
import { getQueryClient } from '@elementor/query';

import { type UserModel } from './api';
import { EDITOR_CURRENT_USER_QUERY_KEY } from './use-current-user';

export function onSetUser( callback: ( user: UserModel | null ) => void ): () => void {
	let unsubscribeQuery: () => void;

	const unsubscribeListener = listenTo( v1ReadyEvent(), () => {
		const queryClient = getQueryClient();

		unsubscribeQuery = queryClient.getQueryCache().subscribe( ( event ) => {
			if ( event.query.queryKey.includes( EDITOR_CURRENT_USER_QUERY_KEY ) ) {
				callback( event.query.state.data as UserModel | null );
			}
		} );
	} );

	return () => {
		unsubscribeQuery();
		unsubscribeListener();
	};
}
