import { useEffect } from 'react';

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
