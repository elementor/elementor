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

type CreatedElementData = {
	elementId: string;
	model: V1ElementModelProps;
	createParams: CreateElementParams;
};

type CreatedElementsResult = {
	elementsData: CreatedElementData[];
};

type ElementData = {
	elementId: string;
	model: V1ElementModelProps;
	parent: V1Element | null;
	at: number;
};

type RemovedElementsResult = {
	elementIds: string[];
	elementsData: ElementData[];
};

// Extended view type to access internal _index property
type ViewWithIndex = {
	_index?: number;
	el?: HTMLElement;
	getDomElement?: () => {
		get?: ( index: number ) => HTMLElement | undefined;
	};
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
						const elementsData: CreatedElementData[] = [];

						elementsParam.forEach( ( createParams ) => {
							const { options, ...elementParams } = createParams;
							const element = createElement( {
								...elementParams,
								options: { ...options, useHistory: false },
							} );

							const elementId = element.id;

							// Store element data for redo - including the element itself
							elementsData.push( {
								elementId,
								model: element.model?.toJSON() || {},
								createParams: {
									...createParams,
									id: elementId,
								},
							} );
						} );

						return { elementsData };
					},
					undo: ( _: { elements: CreateElementParams[] }, { elementsData }: CreatedElementsResult ) => {
						// Delete elements in reverse order to avoid dependency issues
						[ ...elementsData ].reverse().forEach( ( { elementId } ) => {
							deleteElement( {
								elementId,
								options: { useHistory: false },
							} );
						} );
					},
					redo: (
						_: { elements: CreateElementParams[] },
						{ elementsData }: CreatedElementsResult
					): CreatedElementsResult => {
						const newElementsData: CreatedElementData[] = [];

						elementsData.forEach( ( { createParams } ) => {
							// Recreate element with original ID and settings
							const element = createElement( {
								...createParams,
								options: { ...createParams.options, useHistory: false },
							} );

							const elementId = element.id;

							// Store element data again for potential future operations
							const container = getContainer( elementId );
							if ( container ) {
								newElementsData.push( {
									elementId,
									model: container.model.toJSON(),
									createParams,
								} );
							}
						} );

						return { elementsData: newElementsData };
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
						const elementsData: ElementData[] = [];

						// Collect element data before deletion
						elementIdsParam.forEach( ( elementId ) => {
							const container = getContainer( elementId );

							if ( container ) {
								const model = container.model.toJSON();
								const parent = container.parent;

								const at = ( container.view as ViewWithIndex )?._index ?? 0;

								elementsData.push( {
									elementId,
									model,
									parent: parent ?? null,
									at,
								} );
							}
						} );

						// Delete elements
						elementIdsParam.forEach( ( elementId ) => {
							deleteElement( {
								elementId,
								options: { useHistory: false },
							} );
						} );

						return { elementIds: elementIdsParam, elementsData };
					},
					undo: ( _: { elementIds: string[] }, { elementsData }: RemovedElementsResult ) => {
						// Restore elements in reverse order to maintain proper hierarchy
						[ ...elementsData ].reverse().forEach( ( { model, parent, at } ) => {
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
						{ elementIds: originalElementIds, elementsData }: RemovedElementsResult
					): RemovedElementsResult => {
						// Delete elements using their original IDs, gracefully skipping any that no longer exist
						// This handles the case where we undo past element creation and then redo to removal
						originalElementIds.forEach( ( elementId ) => {
							deleteElement( {
								elementId,
								options: { useHistory: false },
							} );
						} );

						return { elementIds: originalElementIds, elementsData };
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
