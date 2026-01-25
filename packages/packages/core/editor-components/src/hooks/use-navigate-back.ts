import { useCallback } from 'react';
import { getV1DocumentsManager } from '@elementor/editor-documents';
import { __useSelector as useSelector } from '@elementor/store';

import { selectPath } from '../store/store';
import { switchToComponent } from '../utils/switch-to-component';

export function useNavigateBack() {
	const path = useSelector( selectPath );

	const documentsManager = getV1DocumentsManager();

	return useCallback( () => {
		const { componentId: prevComponentId, instanceId: prevComponentInstanceId } = path.at( -2 ) ?? {};

		if ( prevComponentId && prevComponentInstanceId ) {
			switchToComponent( prevComponentId, prevComponentInstanceId );

			return;
		}

		switchToComponent( documentsManager.getInitialId() );
	}, [ path, documentsManager ] );
}
