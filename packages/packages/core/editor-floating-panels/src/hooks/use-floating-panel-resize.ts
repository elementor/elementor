import { type PointerEvent as ReactPointerEvent, useCallback, useRef } from 'react';
import { __useSelector as useSelector } from '@elementor/store';

import { isRtl } from '../lib/direction';
import { physicalToLogicalDelta } from '../lib/drag-math';
import {
	applyBlockEndResize,
	applyBlockStartResize,
	applyInlineEndResize,
	applyInlineStartResize,
	type ResizeBounds,
	type ResizeDirection,
} from '../lib/resize-math';
import { APP_BAR_HEIGHT_PX, getSidePanelInlineSize } from '../lib/viewport-bounds';
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
		minBlockStart: APP_BAR_HEIGHT_PX,
	};
}

function applyResize(
	direction: ResizeDirection,
	position: LogicalPosition,
	size: LogicalSize,
	inlineDelta: number,
	blockDelta: number,
	bounds: ResizeBounds
): { position: LogicalPosition; size: LogicalSize } {
	if ( direction === 'inline-end' ) {
		return { position, size: applyInlineEndResize( size, inlineDelta, bounds ) };
	}

	if ( direction === 'block-end' ) {
		return { position, size: applyBlockEndResize( size, blockDelta, bounds ) };
	}

	if ( direction === 'inline-start' ) {
		return applyInlineStartResize( position, size, inlineDelta, bounds );
	}

	if ( direction === 'block-start' ) {
		return applyBlockStartResize( position, size, blockDelta, bounds );
	}

	let next = { position, size };

	if ( direction.includes( 'inline-start' ) ) {
		next = applyInlineStartResize( next.position, next.size, inlineDelta, bounds );
	} else {
		next = { position: next.position, size: applyInlineEndResize( next.size, inlineDelta, bounds ) };
	}

	if ( direction.includes( 'block-start' ) ) {
		next = applyBlockStartResize( next.position, next.size, blockDelta, bounds );
	} else {
		next = { position: next.position, size: applyBlockEndResize( next.size, blockDelta, bounds ) };
	}

	return next;
}

export function useFloatingPanelResize( id: string, direction: ResizeDirection ) {
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

			const next = applyResize(
				direction,
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
		[ direction, minSize, setPosition, setSize ]
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
