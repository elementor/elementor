import { useEffect } from 'react';
import { GLOBAL_STYLES_IMPORTED_EVENT } from '@elementor/editor-canvas';
import { __useDispatch as useDispatch } from '@elementor/store';

import { loadCurrentDocumentClasses } from '../load-document-classes';

export function GlobalStylesImportListener() {
	const dispatch = useDispatch();

	useEffect( () => {
		const handleGlobalStylesImported = () => {
			loadCurrentDocumentClasses();
		};

		window.addEventListener( GLOBAL_STYLES_IMPORTED_EVENT, handleGlobalStylesImported as EventListener );

		return () => {
			window.removeEventListener( GLOBAL_STYLES_IMPORTED_EVENT, handleGlobalStylesImported as EventListener );
		};
	}, [ dispatch ] );

	return null;
}
