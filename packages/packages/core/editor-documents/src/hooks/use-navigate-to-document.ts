import { useCallback } from 'react';
import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';

export default function useNavigateToDocument( options?: { openNewTab?: boolean } ) {
	const { openNewTab = false } = options ?? {};

	return useCallback(
		async ( id: number ) => {
			const url = new URL( window.location.href );

			url.searchParams.set( 'post', id.toString() );
			url.searchParams.delete( 'active-document' );

			if ( openNewTab ) {
				window.open( url.href );
			} else {
				await runCommand( 'editor/documents/switch', {
					id,
					setAsInitial: true,
				} );
				history.replaceState( {}, '', url );
			}
		},
		[ openNewTab ]
	);
}
