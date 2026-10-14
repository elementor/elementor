import { type LogicalPosition } from '../types';
import { clamp } from './clamp';
import {
	type DragBounds,
	getActiveInsetKeys,
	type PanelCorner,
	usesBlockStart,
	usesInlineStart,
} from './corner-position';

export type { DragBounds } from './corner-position';

export type PhysicalDelta = { dx: number; dy: number };

export type LogicalDelta = { inlineDelta: number; blockDelta: number };

export function physicalToLogicalDelta( delta: PhysicalDelta, isRtl: boolean ): LogicalDelta {
	return {
		inlineDelta: isRtl ? -delta.dx : delta.dx,
		blockDelta: delta.dy,
	};
}

export function applyDragDelta(
	corner: PanelCorner,
	position: LogicalPosition,
	delta: LogicalDelta,
	bounds: DragBounds
): LogicalPosition {
	const [ inlineKey, blockKey ] = getActiveInsetKeys( corner );
	const inlineDelta = usesInlineStart( corner ) ? delta.inlineDelta : -delta.inlineDelta;
	const blockDelta = usesBlockStart( corner ) ? delta.blockDelta : -delta.blockDelta;

	const inlineBounds =
		inlineKey === 'insetInlineStart'
			? { min: bounds.minInlineStart, max: bounds.maxInlineStart }
			: { min: bounds.minInlineEnd, max: bounds.maxInlineEnd };

	const blockBounds =
		blockKey === 'insetBlockStart'
			? { min: bounds.minBlockStart, max: bounds.maxBlockStart }
			: { min: bounds.minBlockEnd, max: bounds.maxBlockEnd };

	return {
		...position,
		[ inlineKey ]: clamp( position[ inlineKey ] + inlineDelta, inlineBounds.min, inlineBounds.max ),
		[ blockKey ]: clamp( position[ blockKey ] + blockDelta, blockBounds.min, blockBounds.max ),
	};
}
