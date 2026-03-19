import { undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { createElement } from './create-element';
import { deleteElement } from './delete-element';
import { getContainer } from './get-container';
import { type V1Element, type V1ElementModelProps } from './types';

type RemoveElementsParams = {
	elementIds: string[];
	title: string;
	subtitle?: string;
	onRemoveElements?: () => void;
	onRestoreElements?: () => void;
};

type RemovedElement = {
	container: V1Element;
	containerId: string;
	parent: V1Element;
	parentId: string;
	model: V1ElementModelProps;
	at: number;
};

type RemovedElementsResult = {
	removedElements: RemovedElement[];
};

function resolveContainer( container: V1Element, id: string ): V1Element | null {
	const looked = container.lookup?.();

	if ( looked?.view?.el?.isConnected ) {
		return looked;
	}

	return getContainer( id );
}

export const removeElements = ( {
	elementIds,
	title,
	subtitle = __( 'Item removed', 'elementor' ),
	onRemoveElements,
	onRestoreElements,
}: RemoveElementsParams ): RemovedElementsResult => {
	const undoableRemove = undoable(
		{
			do: ( { elementIds: elementIdsParam }: { elementIds: string[] } ): RemovedElementsResult => {
				const removedElements: RemovedElement[] = [];

				elementIdsParam.forEach( ( elementId ) => {
					const container = getContainer( elementId );

					if ( container?.parent ) {
						removedElements.push( {
							container,
							containerId: container.id,
							parent: container.parent,
							parentId: container.parent.id,
							model: container.model.toJSON(),
							at: container.view?._index ?? 0,
						} );
					}
				} );

				onRemoveElements?.();

				removedElements.forEach( ( { container } ) => {
					deleteElement( {
						container,
						options: { useHistory: false },
					} );
				} );

				return { removedElements };
			},
			undo: ( _: { elementIds: string[] }, { removedElements }: RemovedElementsResult ) => {
				onRestoreElements?.();

				[ ...removedElements ].reverse().forEach( ( { parent, parentId, model, at } ) => {
					const freshParent = resolveContainer( parent, parentId );

					if ( freshParent ) {
						createElement( {
							container: freshParent,
							model,
							options: { useHistory: false, at },
						} );
					}
				} );
			},
			redo: (
				_: { elementIds: string[] },
				{ removedElements }: RemovedElementsResult
			): RemovedElementsResult => {
				onRemoveElements?.();

				const newRemovedElements: RemovedElement[] = [];

				removedElements.forEach( ( { container, containerId, parent, parentId, model, at } ) => {
					const freshContainer = resolveContainer( container, containerId );
					const freshParent = resolveContainer( parent, parentId );

					if ( ! freshContainer || ! freshParent ) {
						return;
					}

					deleteElement( {
						container: freshContainer,
						options: { useHistory: false },
					} );

					newRemovedElements.push( {
						container: freshContainer,
						containerId,
						parent: freshParent,
						parentId,
						model,
						at,
					} );
				} );

				return { removedElements: newRemovedElements };
			},
		},
		{
			title,
			subtitle,
		}
	);

	return undoableRemove( { elementIds } );
};
