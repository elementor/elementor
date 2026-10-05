import { useEffect } from 'react';
import { GLOBAL_STYLES_IMPORTED_EVENT } from '@elementor/editor-canvas';

import { loadDefaultStyles } from '../load-default-styles';

export function GlobalStylesImportListener() {
	useEffect( () => {
		const handleGlobalStylesImported = () => {
			void loadDefaultStyles();
		};

		window.addEventListener( GLOBAL_STYLES_IMPORTED_EVENT, handleGlobalStylesImported );

		return () => {
			window.removeEventListener( GLOBAL_STYLES_IMPORTED_EVENT, handleGlobalStylesImported );
		};
	}, [] );

	return null;
}
