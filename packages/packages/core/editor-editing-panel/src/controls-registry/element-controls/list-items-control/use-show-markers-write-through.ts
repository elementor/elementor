import { useEffect, useRef } from 'react';
import { getContainer, updateElementSettings } from '@elementor/editor-elements';
import { booleanPropTypeUtil } from '@elementor/editor-props';
import { LIST_ITEM_ELEMENT_TYPE } from './list-actions';

// `show_markers` lives on the root list, but each `e-list-item` also carries a mirrored copy so its
// own `Child_Dependency` can attach/detach the marker child. The root list's `show_markers` prop is
// the canonical history state, so this helper only projects that value onto each child item without
// creating an extra history step of its own.
export function syncShowMarkersToItems( {
	listId,
	showMarkers,
}: {
	listId: string;
	showMarkers: boolean;
} ): void {
	getListItemIds( listId ).forEach( ( itemId ) => {
		updateElementSettings( {
			id: itemId,
			props: { show_markers: booleanPropTypeUtil.create( showMarkers ) },
			withHistory: false,
		} );
	} );
}

function getListItemIds( listId: string ): string[] {
	const list = getContainer( listId );

	const itemContainers = ( list?.children ?? [] ).filter(
		( child ) => child.model.get( 'elType' ) === LIST_ITEM_ELEMENT_TYPE
	);

	return itemContainers.map( ( item ): string => item.id );
}

export function useShowMarkersWriteThrough( listId: string, showMarkers: boolean ): void {
	const previousRef = useRef< { listId: string; showMarkers: boolean } | null >( null );

	useEffect( () => {
		const previous = previousRef.current;
		previousRef.current = { listId, showMarkers };

		if ( ! previous || previous.listId !== listId || previous.showMarkers === showMarkers ) {
			return;
		}

		syncShowMarkersToItems( { listId, showMarkers } );
	}, [ listId, showMarkers ] );
}
