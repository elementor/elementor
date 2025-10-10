import { useCallback } from 'react';

import { getUpdateUrl } from './utils';

export default function useOpenDocumentInNewTab() {
	return useCallback( ( id: number ) => {
		const url = getUpdateUrl( id );
		window.open( url.href );
	}, [] );
}
