import { useEffect } from 'react';
import { GLOBAL_STYLES_IMPORTED_EVENT } from '@elementor/editor-canvas';

import { service } from '../service';
import { styleVariablesRepository } from '../style-variables-repository';

export function GlobalStylesImportListener() {
	useEffect( () => {
		const handleGlobalStylesImported = ( event: CustomEvent ) => {
			const importedVars = event.detail?.global_variables;

			if ( ! importedVars ) {
				return;
			}

			if ( importedVars.data && typeof importedVars.data === 'object' ) {
				styleVariablesRepository.update( importedVars.data );
			}

			service.load();
		};

		window.addEventListener( GLOBAL_STYLES_IMPORTED_EVENT, handleGlobalStylesImported as EventListener );

		return () => {
			window.removeEventListener( GLOBAL_STYLES_IMPORTED_EVENT, handleGlobalStylesImported as EventListener );
		};
	}, [] );

	return null;
}
