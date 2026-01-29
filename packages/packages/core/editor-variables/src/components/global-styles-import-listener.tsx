import { useEffect } from 'react';

import { service } from '../service';

export function GlobalStylesImportListener() {
	useEffect( () => {
		const handleGlobalStylesImported = ( event: CustomEvent ) => {
			if ( event.detail?.global_variables ) {
				service.load();
			}
		};

		window.addEventListener( 'elementor/global-styles/imported', handleGlobalStylesImported as EventListener );

		return () => {
			window.removeEventListener(
				'elementor/global-styles/imported',
				handleGlobalStylesImported as EventListener
			);
		};
	}, [] );

	return null;
}
