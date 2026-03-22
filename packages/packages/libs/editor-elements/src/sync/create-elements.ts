import { undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { createElement, type CreateElementParams } from './create-element';
import { deleteElement } from './delete-element';
import { addModelToParent, removeModelFromParent, resolveContainer } from './resolve-element';
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
	containerId: string;
	parentContainerId: string;
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
						containerId: element.id,
						parentContainerId: parentContainer.id,
					} );
				} );

				return { createdElements };
			},
			undo: ( _: { elements: CreateElementParams[] }, { createdElements }: CreatedElementsResult ) => {
				[ ...createdElements ].reverse().forEach( ( { container, containerId, parentContainerId } ) => {
					const freshContainer = resolveContainer( container, containerId );

					if ( freshContainer ) {
						deleteElement( {
							container: freshContainer,
							options: { useHistory: false },
						} );

						return;
					}

					removeModelFromParent( parentContainerId, containerId );
				} );
			},
			redo: (
				_: { elements: CreateElementParams[] },
				{ createdElements }: CreatedElementsResult
			): CreatedElementsResult => {
				const newElements: CreatedElement[] = [];

				createdElements.forEach( ( { parentContainer, parentContainerId, model, options } ) => {
					const freshParent = resolveContainer( parentContainer, parentContainerId );

					if ( freshParent ) {
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
							containerId: element.id,
							parentContainerId: freshParent.id,
						} );

						return;
					}

					addModelToParent( parentContainerId, model );

					newElements.push( {
						container: parentContainer,
						parentContainer,
						model,
						options,
						containerId: model.id ?? '',
						parentContainerId,
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
