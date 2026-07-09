import { useEffect } from 'react';
import { GLOBAL_STYLES_IMPORTED_EVENT, type ImportedGlobalStylesPayload } from '@elementor/editor-canvas';
import { type StyleDefinitionID } from '@elementor/editor-styles';
import { __useDispatch as useDispatch } from '@elementor/store';

import { loadCurrentDocumentClasses } from '../load-document-classes';
import { slice } from '../store';
import { createLabelsForClasses } from '../utils/create-labels-for-classes';
import { trackGlobalClasses } from '../utils/tracking';

export function GlobalStylesImportListener() {
	const dispatch = useDispatch();

	useEffect( () => {
		const handleGlobalStylesImported = async ( event: Event ) => {
			const customEvent = event as CustomEvent< ImportedGlobalStylesPayload >;
			const globalClasses = customEvent.detail?.global_classes;

			if (
				! globalClasses?.added_items_order ||
				! globalClasses?.added_items ||
				globalClasses?.added_items_order?.length === 0
			) {
				await loadCurrentDocumentClasses();
				trackImportedClasses( customEvent.detail?.imported_class_ids );
				return;
			}

			dispatch(
				slice.actions.updateAfterTemplateImport( {
					addedItems: globalClasses.added_items,
					addedIdsOrder: globalClasses.added_items_order,
					addedClassLabels: createLabelsForClasses( Object.values( globalClasses.added_items ) ),
				} )
			);

			trackImportedClasses( globalClasses.added_items_order );
		};

		window.addEventListener( GLOBAL_STYLES_IMPORTED_EVENT, handleGlobalStylesImported as EventListener );

		return () => {
			window.removeEventListener( GLOBAL_STYLES_IMPORTED_EVENT, handleGlobalStylesImported as EventListener );
		};
	}, [ dispatch ] );

	return null;
}

function trackImportedClasses( classIds?: StyleDefinitionID[] ) {
	classIds?.forEach( ( classId ) => {
		trackGlobalClasses( { event: 'classCreated', source: 'imported', classId } );
	} );
}
