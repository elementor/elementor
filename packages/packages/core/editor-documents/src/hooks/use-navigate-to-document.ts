import { useCallback } from 'react';
import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';

import { getUpdateUrl } from './utils';

export default function useNavigateToDocument() {
	return useCallback( async ( id: number, payload?: object, changeUrl: boolean = true ) => {
		
		await runCommand( 'editor/documents/switch', {
			id,
			setAsInitial: true,
			...payload
		} );
		
		if( changeUrl ){
			const url = getUpdateUrl( id );
			history.replaceState( {}, '', url );
		}
	}, [] );
}
