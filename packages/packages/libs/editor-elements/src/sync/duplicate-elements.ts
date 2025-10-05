import { undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { createElement } from './create-element';
import { deleteElement } from './delete-element';
import { duplicateElement } from './duplicate-element';
import { getContainer } from './get-container';
import { type V1ElementModelProps, type V1ElementSettingsProps } from './types';

type DuplicateElementParams = {
	id: string;
	cloneId: string;
	settings: V1ElementSettingsProps;
};

type DuplicateElementsParams = {
	elements: DuplicateElementParams[];
	title: string;
	subtitle?: string;
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
	elements,
	title,
	subtitle = __( 'Item duplicated', 'elementor' ),
}: DuplicateElementsParams ): DuplicatedElementsResult => {
	const undoableDuplicate = undoable(
		{
			do: ( {
				elements: elementsToDuplicate,
			}: {
				elements: DuplicateElementsParams[ 'elements' ];
			} ): DuplicatedElementsResult => {
				const duplicatedElements: DuplicatedElement[] = elementsToDuplicate.reduce(
					( acc, { id, cloneId, settings } ) => {
						const originalContainer = getContainer( id );

						if ( originalContainer?.parent ) {
							const duplicatedElement = duplicateElement( {
								elementId: id,
								settings,
								options: { useHistory: false, cloneId },
							} );

							acc.push( {
								id: duplicatedElement.id,
								model: duplicatedElement.model.toJSON(),
								originalElementId: id,
								modelToRestore: duplicatedElement.model.toJSON(),
								parentContainerId: duplicatedElement.parent?.id,
								at: duplicatedElement.view?._index,
							} );
						}

						return acc;
					},
					[] as DuplicatedElement[]
				);

				return { duplicatedElements };
			},
			undo: (
				_: { elements: DuplicateElementsParams[ 'elements' ] },
				{ duplicatedElements }: DuplicatedElementsResult
			) => {
				// Delete duplicated elements in reverse order to avoid dependency issues
				[ ...duplicatedElements ].reverse().forEach( ( { id } ) => {
					deleteElement( {
						elementId: id,
						options: { useHistory: false },
					} );
				} );
			},
			redo: (
				_: { elements: DuplicateElementsParams[ 'elements' ] },
				{ duplicatedElements: previousElements }: DuplicatedElementsResult
			): DuplicatedElementsResult => {
				const duplicatedElements: DuplicatedElement[] = previousElements.reduce( ( acc, previousElement ) => {
					if ( previousElement.modelToRestore && previousElement.parentContainerId ) {
						const createdElement = createElement( {
							containerId: previousElement.parentContainerId,
							model: previousElement.modelToRestore,
							options: {
								useHistory: false,
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

	return undoableDuplicate( { elements } );
};
