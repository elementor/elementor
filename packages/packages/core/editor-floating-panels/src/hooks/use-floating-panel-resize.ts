import { type PointerEvent as ReactPointerEvent, useCallback, useRef } from 'react';
import { __useSelector as useSelector } from '@elementor/store';

import { isRtl } from '../lib/direction';
import { physicalToLogicalDelta } from '../lib/drag-math';
import {
	applyBlockEndResize,
	applyInlineEndResize,
	applyInlineStartResize,
	type ResizeBounds,
	type ResizeEdge,
} from '../lib/resize-math';
import { getSidePanelInlineSize } from '../lib/viewport-bounds';
import { type GlobalState, selectMinSize } from '../store/selectors';
import { type LogicalPosition, type LogicalSize } from '../types';
import { useFloatingPanelActions } from './use-floating-panel-actions';
import { useFloatingPanelStatus } from './use-floating-panel-status';

type ResizeSession = {
	pointerId: number;
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
	};
}

export function useFloatingPanelResize( id: string, edge: ResizeEdge ) {
	const sessionRef = useRef< ResizeSession | null >( null );
	const { position, size } = useFloatingPanelStatus( id );
	const minSize = useSelector( ( state: GlobalState ) => selectMinSize( state, id ) );
	const { setPosition, setSize } = useFloatingPanelActions( id );

	const onPointerDown = useCallback(
		( event: ReactPointerEvent< HTMLElement > ) => {
			if ( ! position || ! size ) {
				return;
			}

			( event.target as HTMLElement ).setPointerCapture( event.pointerId );

			sessionRef.current = {
				pointerId: event.pointerId,
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

			if ( edge === 'inline-end' ) {
				setSize( applyInlineEndResize( session.startSize, logical.inlineDelta, resizeBounds ) );
				return;
			}

			if ( edge === 'block-end' ) {
				setSize( applyBlockEndResize( session.startSize, logical.blockDelta, resizeBounds ) );
				return;
			}

			const next = applyInlineStartResize(
				session.startPosition,
				session.startSize,
				logical.inlineDelta,
				resizeBounds
			);

			setPosition( next.position );
			setSize( next.size );
		},
		[ edge, minSize, setPosition, setSize ]
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
