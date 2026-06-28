import { type PointerEvent as ReactPointerEvent, useCallback, useRef } from 'react';
import { __useSelector as useSelector } from '@elementor/store';

import { type GlobalState, selectMinSize } from '../store/selectors';
import { type LogicalPosition, type LogicalSize } from '../types';
import {
	activePositionChanged,
	fromStartAnchoredPosition,
	type PanelCorner,
	toStartAnchoredPosition,
} from '../utils/corner-position';
import { isRtl } from '../utils/direction';
import { physicalToLogicalDelta } from '../utils/drag-math';
import { applyResize, type ResizeBounds, type ResizeDirection } from '../utils/resize-math';
import { APP_BAR_HEIGHT_PX, getSidePanelInlineSize } from '../utils/viewport-bounds';
import { useFloatingPanelActions } from './use-floating-panel-actions';
import { useFloatingPanelStatus } from './use-floating-panel-status';

type ResizeSession = {
	pointerId: number;
	direction: ResizeDirection;
	startClientX: number;
	startClientY: number;
	startPosition: LogicalPosition;
	startSize: LogicalSize;
	bounds: ResizeBounds;
	corner: PanelCorner;
	isRtl: boolean;
};

function getResizeBounds(
	corner: PanelCorner,
	position: LogicalPosition,
	currentSize: LogicalSize,
	minSize: LogicalSize
): ResizeBounds {
	const viewport = { width: window.innerWidth, height: window.innerHeight };
	const startAnchored = toStartAnchoredPosition( corner, position, currentSize, viewport );

	return {
		minBlockSize: minSize.blockSize,
		maxBlockSize: window.innerHeight - startAnchored.insetBlockStart,
		minInlineSize: minSize.inlineSize,
		maxInlineSize: window.innerWidth - startAnchored.insetInlineStart,
		minInlineStart: getSidePanelInlineSize(),
		minBlockStart: APP_BAR_HEIGHT_PX,
	};
}

type ResizeHandlePointerHandlers = {
	onPointerDown: ( event: ReactPointerEvent< HTMLElement > ) => void;
	onPointerMove: ( event: ReactPointerEvent< HTMLElement > ) => void;
	onPointerUp: ( event: ReactPointerEvent< HTMLElement > ) => void;
	onPointerCancel: ( event: ReactPointerEvent< HTMLElement > ) => void;
};

export function usePanelResizeInteraction( id: string ) {
	const sessionRef = useRef< ResizeSession | null >( null );
	const { corner, position, size } = useFloatingPanelStatus( id );
	const minSize = useSelector( ( state: GlobalState ) => selectMinSize( state, id ) );
	const { setPosition, setSize } = useFloatingPanelActions( id );

	const onPointerDown = useCallback(
		( direction: ResizeDirection, event: ReactPointerEvent< HTMLElement > ) => {
			if ( ! corner || ! position || ! size || ! minSize ) {
				return;
			}

			event.currentTarget.setPointerCapture( event.pointerId );

			sessionRef.current = {
				pointerId: event.pointerId,
				direction,
				startClientX: event.clientX,
				startClientY: event.clientY,
				startPosition: position,
				startSize: size,
				bounds: getResizeBounds( corner, position, size, minSize ),
				corner,
				isRtl: isRtl(),
			};
		},
		[ corner, position, size, minSize ]
	);

	const onPointerMove = useCallback(
		( event: ReactPointerEvent< HTMLElement > ) => {
			const session = sessionRef.current;

			if ( ! session || session.pointerId !== event.pointerId ) {
				return;
			}

			const physical = { dx: event.clientX - session.startClientX, dy: event.clientY - session.startClientY };
			const logical = physicalToLogicalDelta( physical, session.isRtl );
			const viewport = { width: window.innerWidth, height: window.innerHeight };
			const startAnchoredPosition = toStartAnchoredPosition(
				session.corner,
				session.startPosition,
				session.startSize,
				viewport
			);
			const resizeInput = { ...session.startPosition, ...startAnchoredPosition };
			const next = applyResize(
				session.direction,
				resizeInput,
				session.startSize,
				logical.inlineDelta,
				logical.blockDelta,
				session.bounds
			);
			const nextPosition = fromStartAnchoredPosition(
				session.corner,
				{
					insetBlockStart: next.position.insetBlockStart,
					insetInlineStart: next.position.insetInlineStart,
				},
				next.size,
				viewport
			);

			if ( activePositionChanged( session.corner, session.startPosition, nextPosition ) ) {
				setPosition( nextPosition );
			}

			const sizeChanged =
				next.size.inlineSize !== session.startSize.inlineSize ||
				next.size.blockSize !== session.startSize.blockSize;

			if ( sizeChanged ) {
				setSize( next.size );
			}
		},
		[ setPosition, setSize ]
	);

	const clearSession = useCallback( ( event: ReactPointerEvent< HTMLElement > ) => {
		const session = sessionRef.current;

		if ( ! session || session.pointerId !== event.pointerId ) {
			return;
		}

		sessionRef.current = null;
	}, [] );

	const getResizeHandleProps = useCallback(
		( direction: ResizeDirection ): ResizeHandlePointerHandlers => {
			return {
				onPointerDown: ( event ) => onPointerDown( direction, event ),
				onPointerMove,
				onPointerUp: clearSession,
				onPointerCancel: clearSession,
			};
		},
		[ onPointerDown, onPointerMove, clearSession ]
	);

	return { getResizeHandleProps };
}
