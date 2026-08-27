import { useEffect, useRef } from 'react';
import { getContainer, getElementSettings, updateElementSettings } from '@elementor/editor-elements';
import { booleanPropTypeUtil } from '@elementor/editor-props';
import { undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { HISTORY_DEBOUNCE_WAIT } from '../../../hooks/use-styles-fields';
import { LIST_ITEM_ELEMENT_TYPE } from './list-actions';

type CascadeShowMarkersPayload = {
	listId: string;
	showMarkers: boolean;
};

type CascadeShowMarkersResult = {
	previous: Record< string, ReturnType< typeof booleanPropTypeUtil.create > | null | undefined >;
};

// `show_markers` lives on the root list, but each `e-list-item` also carries a mirrored copy so its
// own `Child_Dependency` can attach/detach the marker child. This write-through keeps those mirrored
// props in sync through a debounced undoable history entry so Undo restores the switch and all items.
export const cascadeShowMarkersToItems = undoable< CascadeShowMarkersPayload, CascadeShowMarkersResult, undefined >(
	{
		do: ( { listId, showMarkers } ) => {
			const itemIds = getListItemIds( listId );

			const previous = Object.fromEntries(
				itemIds.map(
					( itemId ) =>
						[
							itemId,
							getElementSettings< ReturnType< typeof booleanPropTypeUtil.create > >( itemId, [
								'show_markers',
							] ).show_markers,
						] as const
				)
			);

			itemIds.forEach( ( itemId ) => {
				updateElementSettings( {
					id: itemId,
					props: { show_markers: booleanPropTypeUtil.create( showMarkers ) },
					withHistory: false,
				} );
			} );

			return { previous };
		},
		undo: ( _payload, { previous } ) => {
			Object.entries( previous ).forEach( ( [ itemId, previousValue ] ) => {
				updateElementSettings( {
					id: itemId,
					props: { show_markers: previousValue ?? null },
					withHistory: false,
				} );
			} );
		},
	},
	{
		title: __( 'List', 'elementor' ),
		subtitle: __( 'Show Markers', 'elementor' ),
		debounce: { wait: HISTORY_DEBOUNCE_WAIT },
	}
);

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

		cascadeShowMarkersToItems( { listId, showMarkers } );
	}, [ listId, showMarkers ] );
}
