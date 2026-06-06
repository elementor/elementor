import { type LogicalPosition, type LogicalSize } from '../types';
import { clamp } from './clamp';

export type ResizeEdge = 'inline-start' | 'inline-end' | 'block-start' | 'block-end';

export type ResizeCorner =
	| 'block-start-inline-start'
	| 'block-start-inline-end'
	| 'block-end-inline-start'
	| 'block-end-inline-end';

export type ResizeDirection = ResizeEdge | ResizeCorner;

export type ResizeBounds = {
	minInlineSize: number;
	maxInlineSize: number;
	minBlockSize: number;
	maxBlockSize: number;
	minInlineStart: number;
	minBlockStart: number;
};

export function applyInlineEndResize( size: LogicalSize, inlineDelta: number, bounds: ResizeBounds ): LogicalSize {
	return {
		inlineSize: clamp( size.inlineSize + inlineDelta, bounds.minInlineSize, bounds.maxInlineSize ),
		blockSize: size.blockSize,
	};
}

export function applyBlockEndResize( size: LogicalSize, blockDelta: number, bounds: ResizeBounds ): LogicalSize {
	return {
		inlineSize: size.inlineSize,
		blockSize: clamp( size.blockSize + blockDelta, bounds.minBlockSize, bounds.maxBlockSize ),
	};
}

export function applyInlineStartResize(
	position: LogicalPosition,
	size: LogicalSize,
	inlineDelta: number,
	bounds: ResizeBounds
): { position: LogicalPosition; size: LogicalSize } {
	const anchorInlineEnd = position.insetInlineStart + size.inlineSize;
	const lowBound = Math.max( bounds.minInlineStart, anchorInlineEnd - bounds.maxInlineSize );
	const highBound = anchorInlineEnd - bounds.minInlineSize;
	const nextInlineStart = clamp( position.insetInlineStart + inlineDelta, lowBound, highBound );

	return {
		position: { ...position, insetInlineStart: nextInlineStart },
		size: { ...size, inlineSize: anchorInlineEnd - nextInlineStart },
	};
}

export function applyBlockStartResize(
	position: LogicalPosition,
	size: LogicalSize,
	blockDelta: number,
	bounds: ResizeBounds
): { position: LogicalPosition; size: LogicalSize } {
	const anchorBlockEnd = position.insetBlockStart + size.blockSize;
	const lowBound = Math.max( bounds.minBlockStart, anchorBlockEnd - bounds.maxBlockSize );
	const highBound = anchorBlockEnd - bounds.minBlockSize;
	const nextBlockStart = clamp( position.insetBlockStart + blockDelta, lowBound, highBound );

	return {
		position: { ...position, insetBlockStart: nextBlockStart },
		size: { ...size, blockSize: anchorBlockEnd - nextBlockStart },
	};
}
