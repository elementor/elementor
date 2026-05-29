import { type LogicalPosition } from '../types';

export type PhysicalDelta = { dx: number; dy: number };
export type LogicalDelta = { inlineDelta: number; blockDelta: number };

export function physicalToLogicalDelta( delta: PhysicalDelta, isRtl: boolean ): LogicalDelta {
	return {
		inlineDelta: isRtl ? -delta.dx : delta.dx,
		blockDelta: delta.dy,
	};
}

export function applyDragDelta( position: LogicalPosition, delta: LogicalDelta ): LogicalPosition {
	return {
		insetInlineStart: Math.max( 0, position.insetInlineStart + delta.inlineDelta ),
		insetBlockStart: Math.max( 0, position.insetBlockStart + delta.blockDelta ),
	};
}
