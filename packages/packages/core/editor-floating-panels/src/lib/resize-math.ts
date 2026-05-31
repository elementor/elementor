import { type LogicalPosition, type LogicalSize } from '../types';

export type ResizeEdge = 'inline-start' | 'inline-end' | 'block-end';

export type ResizeBounds = {
	minInlineSize: number;
	maxInlineSize: number;
	minBlockSize: number;
	maxBlockSize: number;
	minInlineStart: number;
};

function clamp( value: number, min: number, max: number ): number {
	return Math.min( Math.max( min, value ), Math.max( min, max ) );
}

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
