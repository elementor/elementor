export const ANCHOR_SCROLL_SETTLE_MS = 600;

export const ANCHOR_SCROLL_CORRECTION_THRESHOLD = 1;

export function settleAnchorScrollPosition( {
	getTargetScrollTop,
	getCurrentScrollTop,
	applyScrollTop,
	settleDurationMs = ANCHOR_SCROLL_SETTLE_MS,
	now = () => performance.now(),
	requestFrame = ( callback ) => requestAnimationFrame( callback ),
} ) {
	const startedAt = now();

	const tick = () => {
		const targetScrollTop = getTargetScrollTop();

		if ( Math.abs( targetScrollTop - getCurrentScrollTop() ) > ANCHOR_SCROLL_CORRECTION_THRESHOLD ) {
			applyScrollTop( targetScrollTop );
		}

		if ( now() - startedAt < settleDurationMs ) {
			requestFrame( tick );
		}
	};

	requestFrame( tick );
}
