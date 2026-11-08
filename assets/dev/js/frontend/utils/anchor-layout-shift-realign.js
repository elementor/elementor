/**
 * ED-19404: Native anchor scrolling picks a destination once. Lazy images, fonts, and motion
 * effects above the target can grow the layout while `scroll-behavior: smooth` runs, so the
 * browser finishes above or below the anchor (often ~one section off on first load).
 *
 * After a same-page anchor click or initial `location.hash`, watch the target for
 * {@link WATCH_MS}: {@link ResizeObserver} on `document.body` plus an rAF loop. When the
 * target's document offset drifts past {@link OFFSET_DRIFT}, call `scrollTo` toward the
 * corrected top so the in-flight smooth scroll retargets without an instant jump. After the
 * watch window (or `scrollend` when supported), one more smooth correction if still misaligned.
 */

/** Long enough for a default smooth scroll plus late lazy-load resize on first paint. */
const WATCH_MS = 1200;

/** Ignore sub-pixel layout noise; real shifts (lazy load, spacer growth) are much larger. */
const OFFSET_DRIFT = 2;

function resolveAnchorTarget( hash ) {
	if ( hash.length < 2 ) {
		return null;
	}
	try {
		const node = document.querySelector( hash );
		return node && ( node.matches( '.elementor-element, .elementor-menu-anchor' ) ? node : node.closest( '.elementor-element' ) );
	} catch ( error ) {
		return null;
	}
}

// Sum `offsetTop` along `offsetParent` to detect layout drift (scroll position uses getBoundingClientRect).
function getDocumentOffset( element ) {
	let offsetY = 0;
	for ( let node = element; node; node = node.offsetParent ) {
		offsetY += node.offsetTop;
	}
	return offsetY;
}

function getScrollBehavior() {
	return window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ? 'instant' : 'smooth';
}

// Live viewport Y minus `scrollMarginTop` (sticky offsets from anchor-scroll-margin.js).
function scrollTargetSmoothly( target ) {
	const scrollMarginTop = parseFloat( window.getComputedStyle( target ).scrollMarginTop ) || 0;
	const scrollTop = target.getBoundingClientRect().top + window.scrollY - scrollMarginTop;

	window.scrollTo( {
		top: scrollTop,
		behavior: getScrollBehavior(),
	} );
}

function isMisaligned( target ) {
	const scrollMarginTop = parseFloat( window.getComputedStyle( target ).scrollMarginTop ) || 0;
	return Math.abs( target.getBoundingClientRect().top - scrollMarginTop ) > OFFSET_DRIFT;
}

export function watchAnchorLayoutShift( target ) {
	let lastDocumentOffset = getDocumentOffset( target );
	const watchStartedAt = performance.now();
	let watchFinished = false;

	const correctWhenTargetMoves = () => {
		const currentDocumentOffset = getDocumentOffset( target );

		if ( Math.abs( currentDocumentOffset - lastDocumentOffset ) <= OFFSET_DRIFT ) {
			return;
		}

		scrollTargetSmoothly( target );
		lastDocumentOffset = getDocumentOffset( target );
	};

	const finalCorrectionIfMisaligned = () => {
		if ( ! isMisaligned( target ) ) {
			return;
		}
		scrollTargetSmoothly( target );
	};

	const finishWatch = () => {
		if ( watchFinished ) {
			return;
		}
		watchFinished = true;
		resizeObserver.disconnect();
		finalCorrectionIfMisaligned();
	};

	const resizeObserver = new ResizeObserver( correctWhenTargetMoves );
	resizeObserver.observe( document.body );

	if ( 'onscrollend' in window ) {
		window.addEventListener( 'scrollend', () => {
			if ( ! watchFinished ) {
				finalCorrectionIfMisaligned();
			}
		}, { once: true } );
	}

	( function watchFrame() {
		correctWhenTargetMoves();

		if ( performance.now() - watchStartedAt < WATCH_MS ) {
			requestAnimationFrame( watchFrame );
			return;
		}

		finishWatch();
	} )();
}

export function initAnchorLayoutShiftRealign() {
	// Capture phase: arm the watch before editor/preview handlers call scrollIntoView.
	document.addEventListener( 'click', ( event ) => {
		const link = event.target.closest( 'a[href*="#"]' );
		// Same page only — skip external URLs and other routes (native nav handles those).
		if ( ! link?.hash || link.hostname !== location.hostname || link.pathname !== location.pathname ) {
			return;
		}
		const target = resolveAnchorTarget( link.hash );
		if ( target ) {
			requestAnimationFrame( () => watchAnchorLayoutShift( target ) );
		}
	}, true );

	const hashTarget = resolveAnchorTarget( location.hash );
	if ( hashTarget ) {
		requestAnimationFrame( () => watchAnchorLayoutShift( hashTarget ) );
	}
}
