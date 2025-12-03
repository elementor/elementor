import { undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { getContainer } from './get-container';
import { moveElement, type MoveElementParams } from './move-element';
import { type V1Element } from './types';

type MoveElementsParams = {
	moves: MoveElementParams[];
	title: string;
	subtitle?: string;
	onMoveElements?: () => void;
	onRestoreElements?: () => void;
};

type OriginalPosition = {
	elementId: string;
	originalContainerId: string;
	originalIndex: number;
};

type MovedElement = {
	elementId: string;
	originalPosition: OriginalPosition;
	move: MoveElementParams;
	element: V1Element;
};

type MovedElementsResult = {
	movedElements: MovedElement[];
};

export type { MoveElementsParams, MovedElement, MovedElementsResult };

export const moveElements = ( {
	moves: movesToMake,
	title,
	subtitle = __( 'Elements moved', 'elementor' ),
	onMoveElements,
	onRestoreElements,
}: MoveElementsParams ): MovedElementsResult => {
	const undoableMove = undoable(
		{
			do: ( { moves }: { moves: MoveElementParams[] } ): MovedElementsResult => {
				const movedElements: MovedElement[] = [];
				// Call onMoveElements before moving element to avoid conflicts between commands
				onMoveElements?.();
				moves.forEach( ( move ) => {
					const { elementId } = move;
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
						...move,
						options: { ...move.options, useHistory: false },
					} );

					movedElements.push( {
						elementId,
						originalPosition,
						move,
						element,
					} );
				} );

				return { movedElements };
			},
			undo: ( _: { moves: MoveElementParams[] }, { movedElements }: MovedElementsResult ) => {
				onRestoreElements?.();

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
				onMoveElements?.();

				movedElements.forEach( ( { move, originalPosition } ) => {
					const element = moveElement( {
						...move,
						options: { ...move.options, useHistory: false },
					} );

					newMovedElements.push( {
						elementId: move.elementId,
						originalPosition,
						move,
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

	return undoableMove( { moves: movesToMake } );
};
