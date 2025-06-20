import { useCallback } from 'react';
import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';

export default function useNavigateToDocument() {
	return useCallback( async ( id: number ) => {
		await runCommand( 'editor/documents/switch', {
			id,
			setAsInitial: true,
		} );

		const url = new URL( window.location.href );

		url.searchParams.set( 'post', id.toString() );
		url.searchParams.delete( 'active-document' );

		history.replaceState( {}, '', url );
	}, [] );
}
