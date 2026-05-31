import { type LogicalPosition } from '../types';
import { clamp } from './clamp';

export type PhysicalDelta = { dx: number; dy: number };
export type LogicalDelta = { inlineDelta: number; blockDelta: number };
export type DragBounds = {
	minInlineStart: number;
	maxInlineStart: number;
	minBlockStart: number;
	maxBlockStart: number;
};

export function physicalToLogicalDelta( delta: PhysicalDelta, isRtl: boolean ): LogicalDelta {
	return {
		inlineDelta: isRtl ? -delta.dx : delta.dx,
		blockDelta: delta.dy,
	};
}

export function applyDragDelta( position: LogicalPosition, delta: LogicalDelta, bounds: DragBounds ): LogicalPosition {
	return {
		insetInlineStart: clamp(
			position.insetInlineStart + delta.inlineDelta,
			bounds.minInlineStart,
			bounds.maxInlineStart
		),
		insetBlockStart: clamp(
			position.insetBlockStart + delta.blockDelta,
			bounds.minBlockStart,
			bounds.maxBlockStart
		),
	};
}
