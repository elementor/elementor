import { useCallback } from 'react';
import { getV1DocumentsManager } from '@elementor/editor-documents';
import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import { __useSelector as useSelector } from '@elementor/store';

import { selectPath } from '../store/store';

export function useNavigateBack() {
	const path = useSelector( selectPath );

	const documentsManager = getV1DocumentsManager();

	return useCallback( () => {
		const { componentId: prevComponentId, instanceId: prevComponentInstanceId } = path.at( -2 ) ?? {};

		const switchToDocument = ( id: number, selector?: string ) => {
			runCommand( 'editor/documents/switch', {
				id,
				selector,
				mode: 'autosave',
				setAsInitial: false,
				shouldScroll: false,
			} );
		};

		if ( prevComponentId && prevComponentInstanceId ) {
			switchToDocument( prevComponentId, `[data-id="${ prevComponentInstanceId }"]` );

			return;
		}

		switchToDocument( documentsManager.getInitialId() );
	}, [ path, documentsManager ] );
}
