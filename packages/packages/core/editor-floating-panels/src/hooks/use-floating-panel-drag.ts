import { type PointerEvent as ReactPointerEvent, useCallback, useRef } from 'react';

import { type LogicalPosition, type LogicalSize } from '../types';
import { getDragBounds, type PanelCorner } from '../utils/corner-position';
import { isRtl } from '../utils/direction';
import { applyDragDelta, type DragBounds, physicalToLogicalDelta } from '../utils/drag-math';
import { APP_BAR_HEIGHT_PX, getSidePanelInlineSize } from '../utils/viewport-bounds';
import { useFloatingPanelActions } from './use-floating-panel-actions';
import { useFloatingPanelStatus } from './use-floating-panel-status';

const EMPTY_POSITION: LogicalPosition = {
	insetBlockStart: 0,
	insetBlockEnd: 0,
	insetInlineStart: 0,
	insetInlineEnd: 0,
};

type DragSession = {
	pointerId: number;
	startClientX: number;
	startClientY: number;
	startPosition: LogicalPosition;
	bounds: DragBounds;
	corner: PanelCorner;
	isRtl: boolean;
};

export function useFloatingPanelDrag( id: string ) {
	const sessionRef = useRef< DragSession | null >( null );
	const { corner, position, size } = useFloatingPanelStatus( id );
	const { setPosition } = useFloatingPanelActions( id );

	const onPointerDown = useCallback(
		( event: ReactPointerEvent< HTMLElement > ) => {
			event.currentTarget.setPointerCapture( event.pointerId );

			const panelSize: LogicalSize = size ?? { inlineSize: 0, blockSize: 0 };

			sessionRef.current = {
				pointerId: event.pointerId,
				startClientX: event.clientX,
				startClientY: event.clientY,
				startPosition: position ?? EMPTY_POSITION,
				bounds: getDragBounds(
					panelSize,
					{ width: window.innerWidth, height: window.innerHeight },
					getSidePanelInlineSize(),
					APP_BAR_HEIGHT_PX
				),
				corner: corner ?? 'block-start-inline-start',
				isRtl: isRtl(),
			};
		},
		[ corner, position, size ]
	);

	const onPointerMove = useCallback(
		( event: ReactPointerEvent< HTMLElement > ) => {
			const session = sessionRef.current;

			if ( ! session || session.pointerId !== event.pointerId ) {
				return;
			}

			const physical = { dx: event.clientX - session.startClientX, dy: event.clientY - session.startClientY };
			const logical = physicalToLogicalDelta( physical, session.isRtl );

			setPosition( applyDragDelta( session.corner, session.startPosition, logical, session.bounds ) );
		},
		[ setPosition ]
	);

	const clearSession = useCallback( ( event: ReactPointerEvent< HTMLElement > ) => {
		const session = sessionRef.current;

		if ( ! session || session.pointerId !== event.pointerId ) {
			return;
		}

		sessionRef.current = null;
	}, [] );

	return { onPointerDown, onPointerMove, onPointerUp: clearSession, onPointerCancel: clearSession };
}
