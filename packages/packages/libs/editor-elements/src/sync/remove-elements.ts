import { undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { createElement } from './create-element';
import { deleteElement } from './delete-element';
import { getContainer } from './get-container';
import { addModelToParent, removeModelFromParent, resolveContainer } from './resolve-element';
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
	parent: V1Element;
	model: V1ElementModelProps;
	at: number;
	containerId: string;
	parentId: string;
};

type RemovedElementsResult = {
	removedElements: RemovedElement[];
};

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
							parent: container.parent,
							model: container.model.toJSON(),
							at: container.view?._index ?? 0,
							containerId: container.id,
							parentId: container.parent.id,
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

						return;
					}

					addModelToParent( parentId, model, { at } );
				} );
			},
			redo: (
				_: { elementIds: string[] },
				{ removedElements }: RemovedElementsResult
			): RemovedElementsResult => {
				onRemoveElements?.();

				const newRemovedElements: RemovedElement[] = [];

				removedElements.forEach( ( { container, parent, model, at, containerId, parentId } ) => {
					const freshContainer = resolveContainer( container, containerId );
					const freshParent = resolveContainer( parent, parentId );

					if ( freshContainer && freshParent ) {
						deleteElement( {
							container: freshContainer,
							options: { useHistory: false },
						} );

						newRemovedElements.push( {
							container: freshContainer,
							parent: freshParent,
							model,
							at,
							containerId,
							parentId,
						} );

						return;
					}

					removeModelFromParent( parentId, containerId );

					newRemovedElements.push( {
						container,
						parent,
						model,
						at,
						containerId,
						parentId,
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
