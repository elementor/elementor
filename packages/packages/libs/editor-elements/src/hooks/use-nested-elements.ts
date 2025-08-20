import { useMemo } from 'react';
import { undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { createElement, type CreateElementParams } from '../sync/create-element';
import { deleteElement } from '../sync/delete-element';
import { getContainer } from '../sync/get-container';
import { type V1Element, type V1ElementModelProps } from '../sync/types';

type CreateNestedElementsParams = {
	elements: CreateElementParams[];
	title: string;
	subtitle?: string;
};

type RemoveNestedElementsParams = {
	elementIds: string[];
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

type RemovedElement = {
	elementId: string;
	model: V1ElementModelProps;
	parent: V1Element | null;
	at: number;
};

type RemovedElementsResult = {
	elementIds: string[];
	removedElements: RemovedElement[];
};

export const useNestedElements = () => {
	return useMemo( () => {
		const createElements = ( {
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
									id: elementId,
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

						createdElements.forEach( ( { createParams } ) => {
							const element = createElement( {
								...createParams,
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

		const removeElements = ( {
			elementIds,
			title,
			subtitle = __( 'Item removed', 'elementor' ),
		}: RemoveNestedElementsParams ): RemovedElementsResult => {
			const undoableRemove = undoable(
				{
					do: ( { elementIds: elementIdsParam }: { elementIds: string[] } ): RemovedElementsResult => {
						const removedElements: RemovedElement[] = [];

						elementIdsParam.forEach( ( elementId ) => {
							const container = getContainer( elementId );

							if ( container ) {
								const model = container.model.toJSON();
								const parent = container.parent;

								const at = container.view?._index ?? 0;

								removedElements.push( {
									elementId,
									model,
									parent: parent ?? null,
									at,
								} );
							}
						} );

						elementIdsParam.forEach( ( elementId ) => {
							deleteElement( {
								elementId,
								options: { useHistory: false },
							} );
						} );

						return { elementIds: elementIdsParam, removedElements };
					},
					undo: ( _: { elementIds: string[] }, { removedElements }: RemovedElementsResult ) => {
						// Restore elements in reverse order to maintain proper hierarchy
						[ ...removedElements ].reverse().forEach( ( { model, parent, at } ) => {
							if ( parent && model ) {
								createElement( {
									containerId: parent.id,
									settings: model.settings || {},
									type: model.widgetType || model.elType,
									id: model.id,
									options: { useHistory: false, at },
								} );
							}
						} );
					},
					redo: (
						_: { elementIds: string[] },
						{ elementIds: originalElementIds, removedElements }: RemovedElementsResult
					): RemovedElementsResult => {
						originalElementIds.forEach( ( elementId ) => {
							deleteElement( {
								elementId,
								options: { useHistory: false },
							} );
						} );

						return { elementIds: originalElementIds, removedElements };
					},
				},
				{
					title,
					subtitle,
				}
			);

			return undoableRemove( { elementIds } );
		};

		return {
			create: createElements,
			remove: removeElements,
		};
	}, [] );
};
