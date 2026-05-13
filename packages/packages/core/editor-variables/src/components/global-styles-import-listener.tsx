import { useEffect } from 'react';
import { GLOBAL_STYLES_IMPORTED_EVENT } from '@elementor/editor-canvas';

import { service } from '../service';

export function GlobalStylesImportListener() {
	useEffect( () => {
		const handleGlobalStylesImported = () => {
			service.load();
		};

		window.addEventListener( GLOBAL_STYLES_IMPORTED_EVENT, handleGlobalStylesImported );

		return () => {
			window.removeEventListener( GLOBAL_STYLES_IMPORTED_EVENT, handleGlobalStylesImported );
		};
	}, [] );

	return null;
}
