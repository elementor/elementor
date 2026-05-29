import { type PointerEvent as ReactPointerEvent, useCallback, useRef } from 'react';

import { isRtl } from '../lib/direction';
import { applyDragDelta, physicalToLogicalDelta } from '../lib/drag-math';
import { shouldSnapToDock, SNAP_THRESHOLD_PX } from '../lib/snap-to-dock';
import { type LogicalPosition } from '../types';
import { useFloatingPanelActions } from './use-floating-panel-actions';
import { useFloatingPanelStatus } from './use-floating-panel-status';

type DragSession = {
	pointerId: number;
	startClientX: number;
	startClientY: number;
	startPosition: LogicalPosition;
};

export function useFloatingPanelDrag( id: string ) {
	const sessionRef = useRef< DragSession | null >( null );
	const { position, mode } = useFloatingPanelStatus( id );
	const { setPosition, setMode } = useFloatingPanelActions( id );

	const onPointerDown = useCallback(
		( event: ReactPointerEvent< HTMLElement > ) => {
			if ( mode !== 'floating' ) {
				return;
			}

			( event.target as HTMLElement ).setPointerCapture( event.pointerId );

			sessionRef.current = {
				pointerId: event.pointerId,
				startClientX: event.clientX,
				startClientY: event.clientY,
				startPosition: position ?? { insetInlineStart: 0, insetBlockStart: 0 },
			};
		},
		[ mode, position ]
	);

	const onPointerMove = useCallback(
		( event: ReactPointerEvent< HTMLElement > ) => {
			const session = sessionRef.current;

			if ( ! session || session.pointerId !== event.pointerId ) {
				return;
			}

			const physical = { dx: event.clientX - session.startClientX, dy: event.clientY - session.startClientY };
			const logical = physicalToLogicalDelta( physical, isRtl() );

			setPosition( applyDragDelta( session.startPosition, logical ) );
		},
		[ setPosition ]
	);

	const onPointerUp = useCallback(
		( event: ReactPointerEvent< HTMLElement > ) => {
			const session = sessionRef.current;

			if ( ! session || session.pointerId !== event.pointerId ) {
				return;
			}

			sessionRef.current = null;

			const target = event.target as HTMLElement;
			const panelRect = target.closest< HTMLElement >( '[data-floating-panel]' )?.getBoundingClientRect();

			if ( ! panelRect ) {
				return;
			}

			const viewportRect = {
				left: 0,
				right: window.innerWidth,
				top: 0,
				bottom: window.innerHeight,
			};

			if (
				shouldSnapToDock( {
					panel: {
						left: panelRect.left,
						right: panelRect.right,
						top: panelRect.top,
						bottom: panelRect.bottom,
					},
					viewport: viewportRect,
					isRtl: isRtl(),
				} )
			) {
				setMode( 'docked' );
			}
		},
		[ setMode ]
	);

	return { onPointerDown, onPointerMove, onPointerUp, snapThreshold: SNAP_THRESHOLD_PX };
}
