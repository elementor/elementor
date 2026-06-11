import { type PointerEvent as ReactPointerEvent, useCallback, useRef } from 'react';
import { __useSelector as useSelector } from '@elementor/store';

import { type GlobalState, selectMinSize } from '../store/selectors';
import { type LogicalPosition, type LogicalSize } from '../types';
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
};

const FALLBACK_MIN_SIZE: LogicalSize = { inlineSize: 0, blockSize: 0 };

function getResizeBounds( position: LogicalPosition, minSize: LogicalSize ): ResizeBounds {
	return {
		minInlineSize: minSize.inlineSize,
		maxInlineSize: window.innerWidth - position.insetInlineStart,
		minBlockSize: minSize.blockSize,
		maxBlockSize: window.innerHeight - position.insetBlockStart,
		minInlineStart: getSidePanelInlineSize(),
		minBlockStart: APP_BAR_HEIGHT_PX,
	};
}

type ResizeHandlePointerHandlers = {
	onPointerDown: ( event: ReactPointerEvent< HTMLElement > ) => void;
	onPointerMove: ( event: ReactPointerEvent< HTMLElement > ) => void;
	onPointerUp: ( event: ReactPointerEvent< HTMLElement > ) => void;
};

export function usePanelResizeInteraction( id: string ) {
	const sessionRef = useRef< ResizeSession | null >( null );
	const { position, size } = useFloatingPanelStatus( id );
	const minSize = useSelector( ( state: GlobalState ) => selectMinSize( state, id ) );
	const { setPosition, setSize } = useFloatingPanelActions( id );

	const onPointerDown = useCallback(
		( direction: ResizeDirection, event: ReactPointerEvent< HTMLElement > ) => {
			if ( ! position || ! size ) {
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
			};
		},
		[ position, size ]
	);

	const onPointerMove = useCallback(
		( event: ReactPointerEvent< HTMLElement > ) => {
			const session = sessionRef.current;

			if ( ! session || session.pointerId !== event.pointerId ) {
				return;
			}

			const physical = { dx: event.clientX - session.startClientX, dy: event.clientY - session.startClientY };
			const logical = physicalToLogicalDelta( physical, isRtl() );
			const resizeBounds = getResizeBounds( session.startPosition, minSize ?? FALLBACK_MIN_SIZE );

			const next = applyResize(
				session.direction,
				session.startPosition,
				session.startSize,
				logical.inlineDelta,
				logical.blockDelta,
				resizeBounds
			);

			const positionChanged =
				next.position.insetInlineStart !== session.startPosition.insetInlineStart ||
				next.position.insetBlockStart !== session.startPosition.insetBlockStart;

			if ( positionChanged ) {
				setPosition( next.position );
			}

			setSize( next.size );
		},
		[ minSize, setPosition, setSize ]
	);

	const onPointerUp = useCallback( ( event: ReactPointerEvent< HTMLElement > ) => {
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
				onPointerUp,
			};
		},
		[ onPointerDown, onPointerMove, onPointerUp ]
	);

	return { getResizeHandleProps };
}

export function useFloatingPanelResize( id: string, direction: ResizeDirection ) {
	const { getResizeHandleProps } = usePanelResizeInteraction( id );

	return getResizeHandleProps( direction );
}
