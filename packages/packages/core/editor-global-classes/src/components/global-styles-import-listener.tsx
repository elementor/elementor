import { useEffect } from 'react';
import { GLOBAL_STYLES_IMPORTED_EVENT, type ImportedGlobalStylesPayload } from '@elementor/editor-canvas';
import { __useDispatch as useDispatch } from '@elementor/store';

import { loadCurrentDocumentClasses } from '../load-document-classes';
import { slice } from '../store';

export function GlobalStylesImportListener() {
	const dispatch = useDispatch();

	useEffect( () => {
		const handleGlobalStylesImported = ( event: CustomEvent< ImportedGlobalStylesPayload > ) => {
			const importedClasses = event.detail?.global_classes as ImportedGlobalStylesPayload[ 'global_classes' ];

			if ( importedClasses?.items && importedClasses?.order ) {
				const { items } = importedClasses;

				dispatch(
					slice.actions.mergeExistingClasses( {
						preview: items,
						frontend: items,
					} )
				);

				return;
			}

			void loadCurrentDocumentClasses();
		};

		window.addEventListener( GLOBAL_STYLES_IMPORTED_EVENT, handleGlobalStylesImported as EventListener );

		return () => {
			window.removeEventListener( GLOBAL_STYLES_IMPORTED_EVENT, handleGlobalStylesImported as EventListener );
		};
	}, [ dispatch ] );

	return null;
}
