import { useCallback } from 'react';

import { switchToDocument } from '../sync/utils';
import { getUpdateUrl } from './utils';

export default function useNavigateToDocument() {
	return useCallback( async ( id: number ) => {
		const url = getUpdateUrl( id );
		await switchToDocument( id, { setAsInitial: true } );
		history.replaceState( {}, '', url );
	}, [] );
}
