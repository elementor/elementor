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
	parentContainer: V1Element;
	model: V1ElementModelProps;
	at?: number;
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
					} );
				} );

				return { duplicatedElements };
			},
			undo: ( _: { elementIds: string[] }, { duplicatedElements }: DuplicatedElementsResult ) => {
				onRestoreElements?.();
				[ ...duplicatedElements ].reverse().forEach( ( { container } ) => {
					deleteElement( {
						container,
						options: { useHistory: false },
					} );
				} );
			},
			redo: (
				_: { elementIds: string[] },
				{ duplicatedElements: previousElements }: DuplicatedElementsResult
			): DuplicatedElementsResult => {
				onDuplicateElements?.();
				const duplicatedElements: DuplicatedElement[] = [];

				previousElements.forEach( ( { parentContainer, model, at } ) => {
					const freshParent = parentContainer.lookup?.();

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
