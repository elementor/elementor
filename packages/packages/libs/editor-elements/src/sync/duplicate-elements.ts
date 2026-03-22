import { undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { createElement } from './create-element';
import { deleteElement } from './delete-element';
import { duplicateElement } from './duplicate-element';
import { getContainer } from './get-container';
import {
	addModelToParent,
	findAtomicAncestorId,
	removeModelFromParent,
	rerenderAncestor,
	resolveContainer,
} from './resolve-element';
import { type V1Element, type V1ElementModelProps } from './types';

type DuplicateElementsParams = {
	elementIds: string[];
	title: string;
	subtitle?: string;
	onDuplicateElements?: () => void;
	onRestoreElements?: () => void;
};

type DuplicatedElement = {
	container: V1Element;
	parentContainer: V1Element;
	model: V1ElementModelProps;
	at?: number;
	containerId: string;
	parentContainerId: string;
	atomicAncestorId?: string;
};

type DuplicatedElementsResult = {
	duplicatedElements: DuplicatedElement[];
};

export type { DuplicateElementsParams, DuplicatedElement, DuplicatedElementsResult };

export const duplicateElements = ( {
	elementIds,
	title,
	subtitle = __( 'Item duplicated', 'elementor' ),
	onDuplicateElements,
	onRestoreElements,
}: DuplicateElementsParams ): DuplicatedElementsResult => {
	const undoableDuplicate = undoable(
		{
			do: ( { elementIds: elementIdsToDuplicate }: { elementIds: string[] } ): DuplicatedElementsResult => {
				onDuplicateElements?.();
				const duplicatedElements: DuplicatedElement[] = [];

				elementIdsToDuplicate.forEach( ( elementId ) => {
					const originalContainer = getContainer( elementId );

					if ( ! originalContainer?.parent ) {
						return;
					}

					const duplicatedElement = duplicateElement( {
						element: originalContainer,
						options: { useHistory: false },
					} );

					if ( ! duplicatedElement.parent ) {
						return;
					}

					duplicatedElements.push( {
						container: duplicatedElement,
						parentContainer: duplicatedElement.parent,
						model: duplicatedElement.model.toJSON(),
						at: duplicatedElement.view?._index,
						containerId: duplicatedElement.id,
						parentContainerId: duplicatedElement.parent.id,
						atomicAncestorId: findAtomicAncestorId( duplicatedElement ),
					} );
				} );

				return { duplicatedElements };
			},
			undo: ( _: { elementIds: string[] }, { duplicatedElements }: DuplicatedElementsResult ) => {
				onRestoreElements?.();

				// Atomic nested elements (e.g. Tabs) render children asynchronously via Twig, so
				// the view tree may not contain the child views when undo/redo runs. resolveContainer
				// tries lookup() then getContainer(); if both fail, we fall back to direct model-tree
				// manipulation with silent:true and re-render the atomic ancestor. See ED-22825.
				let atomicToRerender: string | undefined;

				[ ...duplicatedElements ]
					.reverse()
					.forEach( ( { container, containerId, parentContainerId, atomicAncestorId } ) => {
						const freshContainer = resolveContainer( container, containerId );

						if ( freshContainer ) {
							deleteElement( {
								container: freshContainer,
								options: { useHistory: false },
							} );

							return;
						}

						if ( removeModelFromParent( parentContainerId, containerId ) ) {
							atomicToRerender = atomicAncestorId;
						}
					} );

				rerenderAncestor( atomicToRerender );
			},
			redo: (
				_: { elementIds: string[] },
				{ duplicatedElements: previousElements }: DuplicatedElementsResult
			): DuplicatedElementsResult => {
				onDuplicateElements?.();
				const duplicatedElements: DuplicatedElement[] = [];
				let atomicToRerender: string | undefined;

				previousElements.forEach( ( { parentContainer, parentContainerId, atomicAncestorId, model, at } ) => {
					const freshParent = resolveContainer( parentContainer, parentContainerId );

					if ( freshParent ) {
						const createdElement = createElement( {
							container: freshParent,
							model,
							options: { useHistory: false, clone: false, at },
						} );

						duplicatedElements.push( {
							container: createdElement,
							parentContainer: freshParent,
							model,
							at,
							containerId: createdElement.id,
							parentContainerId: freshParent.id,
							atomicAncestorId,
						} );

						return;
					}

					if ( addModelToParent( parentContainerId, model as Record< string, unknown >, { at } ) ) {
						atomicToRerender = atomicAncestorId;
					}

					duplicatedElements.push( {
						container: parentContainer,
						parentContainer,
						model,
						at,
						containerId: model.id ?? '',
						parentContainerId,
						atomicAncestorId,
					} );
				} );

				rerenderAncestor( atomicToRerender );

				return { duplicatedElements };
			},
		},
		{
			title,
			subtitle,
		}
	);

	return undoableDuplicate( { elementIds } );
};
