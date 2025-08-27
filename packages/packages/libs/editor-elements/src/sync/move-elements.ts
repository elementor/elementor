import { undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { getContainer } from './get-container';
import { moveElement, type MoveElementParams } from './move-element';
import { type V1Element } from './types';

type MoveElementsParams = {
	moves: MoveElementParams[];
	title: string;
	subtitle?: string;
};

type OriginalPosition = {
	elementId: string;
	originalContainerId: string;
	originalIndex: number;
};

type MovedElement = {
	elementId: string;
	originalPosition: OriginalPosition;
	moveParams: MoveElementParams;
	element: V1Element;
};

type MovedElementsResult = {
	movedElements: MovedElement[];
};

export type { MoveElementsParams, MovedElement, MovedElementsResult };

export const moveElements = ( {
	moves,
	title,
	subtitle = __( 'Elements moved', 'elementor' ),
}: MoveElementsParams ): MovedElementsResult => {
	const undoableMove = undoable(
		{
			do: ( { moves: movesParam }: { moves: MoveElementParams[] } ): MovedElementsResult => {
				const movedElements: MovedElement[] = [];

				movesParam.forEach( ( moveParams ) => {
					const { elementId } = moveParams;
					const sourceContainer = getContainer( elementId );

					if ( ! sourceContainer ) {
						throw new Error( `Element with ID "${ elementId }" not found` );
					}

					const originalContainerId = sourceContainer.parent?.id || '';
					const originalIndex = sourceContainer.parent?.children?.indexOf( sourceContainer ) ?? -1;

					const originalPosition: OriginalPosition = {
						elementId,
						originalContainerId,
						originalIndex,
					};

					const element = moveElement( {
						...moveParams,
						options: { ...moveParams.options, useHistory: false },
					} );

					movedElements.push( {
						elementId,
						originalPosition,
						moveParams,
						element,
					} );
				} );

				return { movedElements };
			},
			undo: ( _: { moves: MoveElementParams[] }, { movedElements }: MovedElementsResult ) => {
				[ ...movedElements ].reverse().forEach( ( { originalPosition } ) => {
					const { elementId, originalContainerId, originalIndex } = originalPosition;

					moveElement( {
						elementId,
						targetContainerId: originalContainerId,
						options: {
							useHistory: false,
							at: originalIndex >= 0 ? originalIndex : undefined,
						},
					} );
				} );
			},
			redo: (
				_: { moves: MoveElementParams[] },
				{ movedElements }: MovedElementsResult
			): MovedElementsResult => {
				const newMovedElements: MovedElement[] = [];

				movedElements.forEach( ( { moveParams, originalPosition } ) => {
					const element = moveElement( {
						...moveParams,
						options: { ...moveParams.options, useHistory: false },
					} );

					newMovedElements.push( {
						elementId: moveParams.elementId,
						originalPosition,
						moveParams,
						element,
					} );
				} );

				return { movedElements: newMovedElements };
			},
		},
		{
			title,
			subtitle,
		}
	);

	return undoableMove( { moves } );
};
