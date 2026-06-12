import { type PointerEvent as ReactPointerEvent, useCallback, useRef } from 'react';

import { type LogicalPosition, type LogicalSize } from '../types';
import { isRtl } from '../utils/direction';
import { applyDragDelta, type DragBounds, physicalToLogicalDelta } from '../utils/drag-math';
import { APP_BAR_HEIGHT_PX, getSidePanelInlineSize } from '../utils/viewport-bounds';
import { useFloatingPanelActions } from './use-floating-panel-actions';
import { useFloatingPanelStatus } from './use-floating-panel-status';

type DragSession = {
	pointerId: number;
	startClientX: number;
	startClientY: number;
	startPosition: LogicalPosition;
	bounds: DragBounds;
};

function getDragBounds( size: LogicalSize | undefined ): DragBounds {
	return {
		minInlineStart: getSidePanelInlineSize(),
		maxInlineStart: window.innerWidth - ( size?.inlineSize ?? 0 ),
		minBlockStart: APP_BAR_HEIGHT_PX,
		maxBlockStart: window.innerHeight - ( size?.blockSize ?? 0 ),
	};
}

export function useFloatingPanelDrag( id: string ) {
	const sessionRef = useRef< DragSession | null >( null );
	const { position, size } = useFloatingPanelStatus( id );
	const { setPosition } = useFloatingPanelActions( id );

	const onPointerDown = useCallback(
		( event: ReactPointerEvent< HTMLElement > ) => {
			event.currentTarget.setPointerCapture( event.pointerId );

			sessionRef.current = {
				pointerId: event.pointerId,
				startClientX: event.clientX,
				startClientY: event.clientY,
				startPosition: position ?? { insetInlineStart: 0, insetBlockStart: 0 },
				bounds: getDragBounds( size ),
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

			setPosition( applyDragDelta( session.startPosition, logical, session.bounds ) );
		},
		[ setPosition ]
	);

	const onPointerUp = useCallback( ( event: ReactPointerEvent< HTMLElement > ) => {
		const session = sessionRef.current;

		if ( ! session || session.pointerId !== event.pointerId ) {
			return;
		}

		sessionRef.current = null;
	}, [] );

	return { onPointerDown, onPointerMove, onPointerUp };
}
