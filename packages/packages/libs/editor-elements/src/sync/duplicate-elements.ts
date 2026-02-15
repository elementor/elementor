import { undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { createElement } from './create-element';
import { deleteElement } from './delete-element';
import { duplicateElement } from './duplicate-element';
import { getContainer } from './get-container';
import { type V1ElementModelProps } from './types';

type DuplicateElementsParams = {
	elementIds: string[];
	title: string;
	subtitle?: string;
	onDuplicateElements?: () => void;
	onRestoreElements?: () => void;
};

type DuplicatedElement = {
	id: string;
	model: V1ElementModelProps;
	originalElementId: string;
	modelToRestore?: V1ElementModelProps;
	parentContainerId?: string;
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
				// Call onCreate before duplicating elements to avoid conflicts between commands
				onDuplicateElements?.();
				const duplicatedElements: DuplicatedElement[] = elementIdsToDuplicate.reduce( ( acc, elementId ) => {
					const originalContainer = getContainer( elementId );

					if ( originalContainer?.parent ) {
						const duplicatedElement = duplicateElement( {
							elementId,
							options: { useHistory: false },
						} );

						acc.push( {
							id: duplicatedElement.id,
							model: duplicatedElement.model.toJSON(),
							originalElementId: elementId,
							modelToRestore: duplicatedElement.model.toJSON(),
							parentContainerId: duplicatedElement.parent?.id,
							at: duplicatedElement.view?._index,
						} );
					}

					return acc;
				}, [] as DuplicatedElement[] );

				return { duplicatedElements };
			},
			undo: ( _: { elementIds: string[] }, { duplicatedElements }: DuplicatedElementsResult ) => {
				onRestoreElements?.();
				// Delete duplicated elements in reverse order to avoid dependency issues
				[ ...duplicatedElements ].reverse().forEach( ( { id } ) => {
					deleteElement( {
						elementId: id,
						options: { useHistory: false },
					} );
				} );
			},
			redo: (
				_: { elementIds: string[] },
				{ duplicatedElements: previousElements }: DuplicatedElementsResult
			): DuplicatedElementsResult => {
				onDuplicateElements?.();
				const duplicatedElements: DuplicatedElement[] = previousElements.reduce( ( acc, previousElement ) => {
					if ( previousElement.modelToRestore && previousElement.parentContainerId ) {
						const createdElement = createElement( {
							containerId: previousElement.parentContainerId,
							model: previousElement.modelToRestore,
							options: {
								useHistory: false,
								clone: false,
								at: previousElement.at,
							},
						} );

						acc.push( {
							id: createdElement.id,
							model: createdElement.model.toJSON(),
							originalElementId: previousElement.originalElementId,
							modelToRestore: previousElement.modelToRestore,
							parentContainerId: previousElement.parentContainerId,
							at: previousElement.at,
						} );
					}

					return acc;
				}, [] as DuplicatedElement[] );

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
