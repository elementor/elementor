import { useEffect } from 'react';
import { getCurrentDocument } from '@elementor/editor-documents';
import { __useDispatch as useDispatch } from '@elementor/store';

import { fetchAndDispatchGlobalClasses } from '../load-global-classes-state';
import { slice } from '../store';

export function GlobalStylesImportListener() {
	const dispatch = useDispatch();

	useEffect( () => {
		const handleGlobalStylesImported = ( event: CustomEvent ) => {
			const importedClasses = event.detail?.global_classes;

			if ( importedClasses?.items && importedClasses?.order ) {
				const items = importedClasses.items as Record< string, { id: string; label: string } >;

				dispatch(
					slice.actions.load( {
						preview: {
							items: importedClasses.items,
							order: importedClasses.order,
						},
						frontend: {
							items: importedClasses.items,
							order: importedClasses.order,
						},
						classLabels: Object.fromEntries(
							Object.entries( items ).map( ( [ id, item ] ) => [ id, item.label ] )
						),
					} )
				);
			}

			fetchAndDispatchGlobalClasses( getCurrentDocument()?.id ).catch( () => {} );
		};

		window.addEventListener( 'elementor/global-styles/imported', handleGlobalStylesImported as EventListener );

		return () => {
			window.removeEventListener(
				'elementor/global-styles/imported',
				handleGlobalStylesImported as EventListener
			);
		};
	}, [ dispatch ] );

	return null;
}
