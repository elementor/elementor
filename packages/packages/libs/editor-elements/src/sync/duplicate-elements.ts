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
	onCreate?: ( duplicatedElements: DuplicatedElement[] ) => DuplicatedElement[];
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
	onCreate,
}: DuplicateElementsParams ): DuplicatedElementsResult => {
	const undoableDuplicate = undoable(
		{
			do: ( { elementIds: elementIdsParam }: { elementIds: string[] } ): DuplicatedElementsResult => {
				let duplicatedElements: DuplicatedElement[] = [];

				// Duplicate each element
				elementIdsParam.forEach( ( elementId ) => {
					const originalContainer = getContainer( elementId );
					if ( ! originalContainer?.parent ) {
						return;
					}

					const duplicatedElement = duplicateElement( {
						elementId,
						options: { useHistory: false, clone: true },
					} );

					const container = getContainer( duplicatedElement.id );

					if ( container ) {
						duplicatedElements.push( {
							id: duplicatedElement.id,
							model: container.model.toJSON(),
							originalElementId: elementId,
							modelToRestore: container.model.toJSON(),
							parentContainerId: container.parent?.id,
							at: container.view?._index,
						} );
					}
				} );

				// Call onCreate callback if provided
				if ( onCreate ) {
					duplicatedElements = onCreate( duplicatedElements );
				}

				return { duplicatedElements };
			},
			undo: ( _: { elementIds: string[] }, { duplicatedElements }: DuplicatedElementsResult ) => {
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
				let duplicatedElements: DuplicatedElement[] = [];

				// Recreate elements from stored models instead of duplicating from originals
				previousElements.forEach( ( previousElement ) => {
					if ( ! previousElement.modelToRestore || ! previousElement.parentContainerId ) {
						return;
					}

					const createdElement = createElement( {
						containerId: previousElement.parentContainerId,
						model: previousElement.modelToRestore,
						options: {
							useHistory: false,
							clone: false,
							at: previousElement.at,
						},
					} );

					const container = getContainer( createdElement.id );

					if ( container ) {
						duplicatedElements.push( {
							id: createdElement.id,
							model: container.model.toJSON(),
							originalElementId: previousElement.originalElementId,
							modelToRestore: previousElement.modelToRestore,
							parentContainerId: previousElement.parentContainerId,
							at: previousElement.at,
						} );
					}
				} );

				// Call onCreate callback if provided
				if ( onCreate ) {
					duplicatedElements = onCreate( duplicatedElements );
				}

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
