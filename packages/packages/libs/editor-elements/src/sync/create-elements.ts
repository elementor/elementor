import { undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { createElement, type CreateElementParams } from './create-element';
import { deleteElement } from './delete-element';
import { type V1Element, type V1ElementModelProps } from './types';

type CreateElementsParams = {
	elements: CreateElementParams[];
	title: string;
	subtitle?: string;
};

type CreatedElement = {
	container: V1Element;
	parentContainer: V1Element;
	model: V1ElementModelProps;
	options?: CreateElementParams[ 'options' ];
};

type CreatedElementsResult = {
	createdElements: CreatedElement[];
};

export type { CreateElementsParams, CreatedElement, CreatedElementsResult };

export const createElements = ( {
	elements,
	title,
	subtitle = __( 'Item added', 'elementor' ),
}: CreateElementsParams ): CreatedElementsResult => {
	const undoableCreate = undoable(
		{
			do: ( { elements: elementsParam }: { elements: CreateElementParams[] } ): CreatedElementsResult => {
				const createdElements: CreatedElement[] = [];

				elementsParam.forEach( ( { container, options, ...elementParams } ) => {
					const parentContainer = container.lookup?.() ?? container;

					if ( ! parentContainer ) {
						throw new Error( 'Parent container not found' );
					}

					const element = createElement( {
						container: parentContainer,
						...elementParams,
						options: { ...options, useHistory: false },
					} );

					createdElements.push( {
						container: element,
						parentContainer,
						model: element.model?.toJSON() || {},
						options,
					} );
				} );

				return { createdElements };
			},
			undo: ( _: { elements: CreateElementParams[] }, { createdElements }: CreatedElementsResult ) => {
				[ ...createdElements ].reverse().forEach( ( { container } ) => {
					const freshContainer = container.lookup?.();

					if ( freshContainer ) {
						deleteElement( {
							container: freshContainer,
							options: { useHistory: false },
						} );
					}
				} );
			},
			redo: (
				_: { elements: CreateElementParams[] },
				{ createdElements }: CreatedElementsResult
			): CreatedElementsResult => {
				const newElements: CreatedElement[] = [];

				createdElements.forEach( ( { parentContainer, model, options } ) => {
					const freshParent = parentContainer.lookup?.();

					if ( ! freshParent ) {
						return;
					}

					const element = createElement( {
						container: freshParent,
						model,
						options: { ...options, useHistory: false },
					} );

					newElements.push( {
						container: element,
						parentContainer: freshParent,
						model: element.model.toJSON(),
						options,
					} );
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
