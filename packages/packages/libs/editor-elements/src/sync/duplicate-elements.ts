import { undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { createElement } from './create-element';
import { deleteElement } from './delete-element';
import { duplicateElement } from './duplicate-element';
import { getContainer } from './get-container';
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
	containerId: string;
	parentContainer: V1Element;
	parentContainerId: string;
	model: V1ElementModelProps;
	at?: number;
};

type DuplicatedElementsResult = {
	duplicatedElements: DuplicatedElement[];
};

export type { DuplicateElementsParams, DuplicatedElement, DuplicatedElementsResult };

function resolveContainer( container: V1Element, id: string ): V1Element | null {
	const looked = container.lookup?.();

	if ( looked?.view?.el?.isConnected ) {
		return looked;
	}

	return getContainer( id );
}

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
						containerId: duplicatedElement.id,
						parentContainer: duplicatedElement.parent,
						parentContainerId: duplicatedElement.parent.id,
						model: duplicatedElement.model.toJSON(),
						at: duplicatedElement.view?._index,
					} );
				} );

				return { duplicatedElements };
			},
			undo: ( _: { elementIds: string[] }, { duplicatedElements }: DuplicatedElementsResult ) => {
				onRestoreElements?.();
				[ ...duplicatedElements ].reverse().forEach( ( { container, containerId } ) => {
					const freshContainer = resolveContainer( container, containerId );

					if ( freshContainer ) {
						deleteElement( {
							container: freshContainer,
							options: { useHistory: false },
						} );
					}
				} );
			},
			redo: (
				_: { elementIds: string[] },
				{ duplicatedElements: previousElements }: DuplicatedElementsResult
			): DuplicatedElementsResult => {
				onDuplicateElements?.();
				const duplicatedElements: DuplicatedElement[] = [];

				previousElements.forEach( ( { parentContainer, parentContainerId, model, at } ) => {
					const freshParent = resolveContainer( parentContainer, parentContainerId );

					if ( freshParent ) {
						const createdElement = createElement( {
							container: freshParent,
							model,
							options: { useHistory: false, clone: false, at },
						} );

						duplicatedElements.push( {
							container: createdElement,
							containerId: createdElement.id,
							parentContainer: freshParent,
							parentContainerId,
							model,
							at,
						} );
					}
				} );

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
