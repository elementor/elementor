import { useCallback, useRef } from 'react';

import { type SizeAxis } from './commit-active-style-size';

const PREVIEW_WIDTH_PROPERTY = 'width';
const PREVIEW_HEIGHT_PROPERTY = 'height';

type DragState = {
	axis: SizeAxis;
	startPointerX: number;
	startPointerY: number;
	startWidth: number;
	startHeight: number;
};

type UseResizeDragArgs = {
	element: HTMLElement;
	onPreview: ( sizes: { width: number; height: number } ) => void;
	onCommit: ( sizes: { width: number; height: number } ) => void;
};

export function useResizeDrag( { element, onPreview, onCommit }: UseResizeDragArgs ) {
	const dragStateRef = useRef< DragState | null >( null );
	const previewSizesRef = useRef< { width: number; height: number } | null >( null );

	const clearPreview = useCallback( () => {
		element.style.removeProperty( PREVIEW_WIDTH_PROPERTY );
		element.style.removeProperty( PREVIEW_HEIGHT_PROPERTY );
	}, [ element ] );

	const applyPreview = useCallback(
		( sizes: { width: number; height: number } ) => {
			previewSizesRef.current = sizes;
			element.style.width = `${ sizes.width }px`;
			element.style.height = `${ sizes.height }px`;
			onPreview( sizes );
		},
		[ element, onPreview ]
	);

	const handlePointerMove = useCallback(
		( event: PointerEvent ) => {
			const dragState = dragStateRef.current;

			if ( ! dragState ) {
				return;
			}

			const deltaX = event.clientX - dragState.startPointerX;
			const deltaY = event.clientY - dragState.startPointerY;

			const width =
				dragState.axis === 'width'
					? dragState.startWidth + deltaX
					: dragState.startWidth;
			const height =
				dragState.axis === 'height'
					? dragState.startHeight + deltaY
					: dragState.startHeight;

			applyPreview( { width, height } );
		},
		[ applyPreview ]
	);

	const endDrag = useCallback(
		( event: PointerEvent ) => {
			const dragState = dragStateRef.current;

			if ( ! dragState ) {
				return;
			}

			dragStateRef.current = null;

			const ownerDocument = element.ownerDocument;
			ownerDocument.removeEventListener( 'pointermove', handlePointerMove );
			ownerDocument.removeEventListener( 'pointerup', endDrag );
			ownerDocument.removeEventListener( 'pointercancel', endDrag );

			const deltaX = event.clientX - dragState.startPointerX;
			const deltaY = event.clientY - dragState.startPointerY;

			const finalSizes = {
				width:
					dragState.axis === 'width'
						? dragState.startWidth + deltaX
						: dragState.startWidth,
				height:
					dragState.axis === 'height'
						? dragState.startHeight + deltaY
						: dragState.startHeight,
			};

			if ( event.target instanceof HTMLElement && event.target.hasPointerCapture( event.pointerId ) ) {
				event.target.releasePointerCapture( event.pointerId );
			}

			clearPreview();
			onCommit( finalSizes );
		},
		[ clearPreview, element.ownerDocument, handlePointerMove, onCommit ]
	);

	const startDrag = useCallback(
		( event: React.PointerEvent, axis: SizeAxis ) => {
			event.preventDefault();
			event.stopPropagation();

			if ( event.currentTarget instanceof HTMLElement ) {
				event.currentTarget.setPointerCapture( event.pointerId );
			}

			const rect = element.getBoundingClientRect();

			dragStateRef.current = {
				axis,
				startPointerX: event.clientX,
				startPointerY: event.clientY,
				startWidth: rect.width,
				startHeight: rect.height,
			};

			const ownerDocument = element.ownerDocument;

			ownerDocument.addEventListener( 'pointermove', handlePointerMove );
			ownerDocument.addEventListener( 'pointerup', endDrag );
			ownerDocument.addEventListener( 'pointercancel', endDrag );
		},
		[ element, endDrag, handlePointerMove ]
	);

	return { startDrag };
}
