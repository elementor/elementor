import { undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { createElement } from './create-element';
import { deleteElement } from './delete-element';
import { getContainer } from './get-container';
import {
	addModelToParent,
	findAtomicAncestorId,
	removeModelFromParent,
	rerenderAncestor,
	resolveContainer,
} from './resolve-element';
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
	atomicAncestorId?: string;
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
							atomicAncestorId: findAtomicAncestorId( container ),
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

				// Fallback for async-rendered nested elements whose views may not exist yet (ED-22825).
				let ancestorToRerender: string | undefined;

				[ ...removedElements ].reverse().forEach( ( { parent, parentId, atomicAncestorId, model, at } ) => {
					const freshParent = resolveContainer( parent, parentId );

					if ( freshParent ) {
						createElement( {
							container: freshParent,
							model,
							options: { useHistory: false, at },
						} );

						return;
					}

					if ( addModelToParent( parentId, model, { at } ) ) {
						ancestorToRerender = atomicAncestorId;
					}
				} );

				if ( ancestorToRerender ) {
					rerenderAncestor( ancestorToRerender );
				}
			},
			redo: (
				_: { elementIds: string[] },
				{ removedElements }: RemovedElementsResult
			): RemovedElementsResult => {
				onRemoveElements?.();

				const newRemovedElements: RemovedElement[] = [];
				let ancestorToRerender: string | undefined;

				removedElements.forEach(
					( { container, parent, model, at, containerId, parentId, atomicAncestorId } ) => {
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
								atomicAncestorId,
							} );

							return;
						}

						if ( removeModelFromParent( parentId, containerId ) ) {
							ancestorToRerender = atomicAncestorId;
						}

						newRemovedElements.push( {
							container,
							parent,
							model,
							at,
							containerId,
							parentId,
							atomicAncestorId,
						} );
					}
				);

				if ( ancestorToRerender ) {
					rerenderAncestor( ancestorToRerender );
				}

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
