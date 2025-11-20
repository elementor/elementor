import { undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { createElement } from './create-element';
import { deleteElement } from './delete-element';
import { getContainer } from './get-container';
import { type V1Element, type V1ElementModelProps } from './types';

type RemoveNestedElementsParams = {
	elementIds: string[];
	title: string;
	subtitle?: string;
	onRemoveElements?: () => void;
	onRestoreElements?: () => void;
};

type RemovedElement = {
	elementId: string;
	model: V1ElementModelProps;
	parent: V1Element | null;
	at: number;
};

type RemovedElementsResult = {
	elementIds: string[];
	removedElements: RemovedElement[];
};

export type { RemoveNestedElementsParams, RemovedElement, RemovedElementsResult };

export const removeElements = ( {
	elementIds,
	title,
	subtitle = __( 'Item removed', 'elementor' ),
	onRemoveElements,
	onRestoreElements,
}: RemoveNestedElementsParams ): RemovedElementsResult => {
	const undoableRemove = undoable(
		{
			do: ( { elementIds: elementIdsParam }: { elementIds: string[] } ): RemovedElementsResult => {
				const removedElements: RemovedElement[] = [];

				elementIdsParam.forEach( ( elementId ) => {
					const container = getContainer( elementId );

					if ( container ) {
						const model = container.model.toJSON();
						const parent = container.parent;

						const at = container.view?._index ?? 0;

						removedElements.push( {
							elementId,
							model,
							parent: parent ?? null,
							at,
						} );
					}
				} );

				// Call onRemoveElements before deleting elements to avoid conflicts between commands
				onRemoveElements?.();

				elementIdsParam.forEach( ( elementId ) => {
					deleteElement( {
						elementId,
						options: { useHistory: false },
					} );
				} );

				return { elementIds: elementIdsParam, removedElements };
			},
			undo: ( _: { elementIds: string[] }, { removedElements }: RemovedElementsResult ) => {
				onRestoreElements?.();

				// Restore elements in reverse order to maintain proper hierarchy
				[ ...removedElements ].reverse().forEach( ( { model, parent, at } ) => {
					if ( parent && model ) {
						createElement( {
							containerId: parent.id,
							model,
							options: { useHistory: false, at },
						} );
					}
				} );
			},
			redo: (
				_: { elementIds: string[] },
				{ elementIds: originalElementIds, removedElements }: RemovedElementsResult
			): RemovedElementsResult => {
				onRemoveElements?.();

				originalElementIds.forEach( ( elementId ) => {
					deleteElement( {
						elementId,
						options: { useHistory: false },
					} );
				} );

				return { elementIds: originalElementIds, removedElements };
			},
		},
		{
			title,
			subtitle,
		}
	);

	return undoableRemove( { elementIds } );
};
