import { undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { getContainer } from './get-container';
import { moveElement } from './move-element';
import { type V1Element } from './types';

type MoveOptions = {
	useHistory?: boolean;
	at?: number;
	edit?: boolean;
};

type MoveInput = {
	element: V1Element;
	targetContainer: V1Element;
	options?: MoveOptions;
};

type MoveElementsParams = {
	moves: MoveInput[];
	title: string;
	subtitle?: string;
	onMoveElements?: () => void;
	onRestoreElements?: () => void;
};

type MovedElement = {
	element: V1Element;
	elementId: string;
	originalContainer: V1Element;
	originalContainerId: string;
	originalIndex: number;
	targetContainer: V1Element;
	targetContainerId: string;
	options?: MoveOptions;
};

type MovedElementsResult = {
	movedElements: MovedElement[];
};

export type { MoveElementsParams, MoveInput, MovedElement, MovedElementsResult };

function resolveContainer( container: V1Element, id: string ): V1Element | null {
	const looked = container.lookup?.();

	if ( looked?.view?.el?.isConnected ) {
		return looked;
	}

	return getContainer( id );
}

export const moveElements = ( {
	moves: movesToMake,
	title,
	subtitle = __( 'Elements moved', 'elementor' ),
	onMoveElements,
	onRestoreElements,
}: MoveElementsParams ): MovedElementsResult => {
	const undoableMove = undoable(
		{
			do: ( { moves }: { moves: MoveInput[] } ): MovedElementsResult => {
				const movedElements: MovedElement[] = [];
				onMoveElements?.();

				moves.forEach( ( { element, targetContainer, options } ) => {
					const sourceElement = element.lookup?.() ?? element;
					const target = targetContainer.lookup?.() ?? targetContainer;

					if ( ! sourceElement ) {
						throw new Error( 'Element not found' );
					}

					if ( ! target ) {
						throw new Error( 'Target container not found' );
					}

					if ( ! sourceElement.parent ) {
						throw new Error( 'Element has no parent container' );
					}

					const originalContainer = sourceElement.parent;
					const originalIndex = originalContainer.children?.indexOf( sourceElement ) ?? -1;

					const newElement = moveElement( {
						element: sourceElement,
						targetContainer: target,
						options: { ...options, useHistory: false },
					} );

					movedElements.push( {
						element: newElement,
						elementId: newElement.id,
						originalContainer,
						originalContainerId: originalContainer.id,
						originalIndex,
						targetContainer: target,
						targetContainerId: target.id,
						options,
					} );
				} );

				return { movedElements };
			},
			undo: ( _: { moves: MoveInput[] }, { movedElements }: MovedElementsResult ) => {
				onRestoreElements?.();

				[ ...movedElements ]
					.reverse()
					.forEach( ( { element, elementId, originalContainer, originalContainerId, originalIndex } ) => {
						const freshElement = resolveContainer( element, elementId );
						const freshOriginalContainer = resolveContainer( originalContainer, originalContainerId );

						if ( ! freshElement || ! freshOriginalContainer ) {
							return;
						}

						moveElement( {
							element: freshElement,
							targetContainer: freshOriginalContainer,
							options: {
								useHistory: false,
								at: originalIndex >= 0 ? originalIndex : undefined,
							},
						} );
					} );
			},
			redo: ( _: { moves: MoveInput[] }, { movedElements }: MovedElementsResult ): MovedElementsResult => {
				const newMovedElements: MovedElement[] = [];
				onMoveElements?.();

				movedElements.forEach(
					( {
						element,
						elementId,
						originalContainer,
						originalContainerId,
						originalIndex,
						targetContainer,
						targetContainerId,
						options,
					} ) => {
						const freshElement = resolveContainer( element, elementId );
						const freshOriginalContainer = resolveContainer( originalContainer, originalContainerId );
						const freshTarget = resolveContainer( targetContainer, targetContainerId );

						if ( ! freshElement || ! freshOriginalContainer || ! freshTarget ) {
							return;
						}

						const newElement = moveElement( {
							element: freshElement,
							targetContainer: freshTarget,
							options: { ...options, useHistory: false },
						} );

						newMovedElements.push( {
							element: newElement,
							elementId: newElement.id,
							originalContainer: freshOriginalContainer,
							originalContainerId,
							originalIndex,
							targetContainer: freshTarget,
							targetContainerId,
							options,
						} );
					}
				);

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
