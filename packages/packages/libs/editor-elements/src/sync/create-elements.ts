import { undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { createElement, type CreateElementParams } from './create-element';
import { deleteElement } from './delete-element';
import {
	addModelToParent,
	findAtomicAncestorId,
	removeModelFromParent,
	rerenderAncestor,
	resolveContainer,
} from './resolve-element';
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
	atomicAncestorId?: string;
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
						atomicAncestorId: findAtomicAncestorId( parentContainer ),
					} );
				} );

				return { createdElements };
			},
			undo: ( _: { elements: CreateElementParams[] }, { createdElements }: CreatedElementsResult ) => {
				// Fallback for async-rendered nested elements whose views may not exist yet (ED-22825).
				let ancestorToRerender: string | undefined;

				[ ...createdElements ]
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
							ancestorToRerender = atomicAncestorId;
						}
					} );

				if ( ancestorToRerender ) {
					rerenderAncestor( ancestorToRerender );
				}
			},
			redo: (
				_: { elements: CreateElementParams[] },
				{ createdElements }: CreatedElementsResult
			): CreatedElementsResult => {
				const newElements: CreatedElement[] = [];
				let ancestorToRerender: string | undefined;

				createdElements.forEach(
					( { parentContainer, parentContainerId, atomicAncestorId, model, options } ) => {
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
								atomicAncestorId,
							} );

							return;
						}

						if ( addModelToParent( parentContainerId, model ) ) {
							ancestorToRerender = atomicAncestorId;
						}

						newElements.push( {
							container: parentContainer,
							parentContainer,
							model,
							options,
							containerId: model.id ?? '',
							parentContainerId,
							atomicAncestorId,
						} );
					}
				);

				if ( ancestorToRerender ) {
					rerenderAncestor( ancestorToRerender );
				}

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
