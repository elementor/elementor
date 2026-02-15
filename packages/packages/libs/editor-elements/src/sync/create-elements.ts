import { undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { createElement, type CreateElementParams } from './create-element';
import { deleteElement } from './delete-element';
import { getContainer } from './get-container';
import { type V1ElementModelProps } from './types';

type CreateNestedElementsParams = {
	elements: CreateElementParams[];
	title: string;
	subtitle?: string;
};

type CreatedElement = {
	elementId: string;
	model: V1ElementModelProps;
	createParams: CreateElementParams;
};

type CreatedElementsResult = {
	createdElements: CreatedElement[];
};

export type { CreateNestedElementsParams, CreatedElement, CreatedElementsResult };

export const createElements = ( {
	elements,
	title,
	subtitle = __( 'Item added', 'elementor' ),
}: CreateNestedElementsParams ): CreatedElementsResult => {
	const undoableCreate = undoable(
		{
			do: ( { elements: elementsParam }: { elements: CreateElementParams[] } ): CreatedElementsResult => {
				const createdElements: CreatedElement[] = [];

				elementsParam.forEach( ( createParams ) => {
					const { options, ...elementParams } = createParams;
					const element = createElement( {
						...elementParams,
						options: { ...options, useHistory: false },
					} );

					const elementId = element.id;

					createdElements.push( {
						elementId,
						model: element.model?.toJSON() || {},
						createParams: {
							...createParams,
						},
					} );
				} );

				return { createdElements };
			},
			undo: ( _: { elements: CreateElementParams[] }, { createdElements }: CreatedElementsResult ) => {
				// Delete elements in reverse order to avoid dependency issues
				[ ...createdElements ].reverse().forEach( ( { elementId } ) => {
					deleteElement( {
						elementId,
						options: { useHistory: false },
					} );
				} );
			},
			redo: (
				_: { elements: CreateElementParams[] },
				{ createdElements }: CreatedElementsResult
			): CreatedElementsResult => {
				const newElements: CreatedElement[] = [];

				createdElements.forEach( ( { createParams, model } ) => {
					const element = createElement( {
						containerId: createParams.containerId,
						model,
						options: { ...createParams.options, useHistory: false },
					} );

					const elementId = element.id;

					const container = getContainer( elementId );

					if ( container ) {
						newElements.push( {
							elementId,
							model: container.model.toJSON(),
							createParams,
						} );
					}
				} );

				return { createdElements: newElements };
			},
		},
		{
			title,
			subtitle,
		}
	);

	return undoableCreate( { elements } );
};
