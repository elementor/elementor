const WATCH_MS = 600;
const OFFSET_DRIFT = 2;

function resolveAnchorTarget( hash ) {
	if ( hash.length < 2 ) {
		return null;
	}
	try {
		const node = document.querySelector( hash );
		return node && ( node.matches( '.elementor-element, .elementor-menu-anchor' ) ? node : node.closest( '.elementor-element' ) );
	} catch ( e ) {
		return null;
	}
}

function documentOffset( el ) {
	let y = 0;
	for ( ; el; el = el.offsetParent ) {
		y += el.offsetTop;
	}
	return y;
}

function realign( target ) {
	target.scrollIntoView( {
		block: 'start',
		behavior: window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ? 'instant' : 'smooth',
	} );
}

export function watchAnchorLayoutShift( target ) {
	let last = documentOffset( target );
	const t0 = performance.now();
	const fix = () => {
		const next = documentOffset( target );
		if ( Math.abs( next - last ) > OFFSET_DRIFT ) {
			realign( target );
			last = documentOffset( target );
		}
	};
	const ro = new ResizeObserver( fix );
	ro.observe( document.body );
	( function loop() {
		fix();
		if ( performance.now() - t0 < WATCH_MS ) {
			requestAnimationFrame( loop );
		} else {
			ro.disconnect();
		}
	} )();
}

export function initAnchorLayoutShiftRealign() {
	document.addEventListener( 'click', ( e ) => {
		const a = e.target.closest( 'a[href*="#"]' );
		if ( ! a?.hash || a.hostname !== location.hostname || a.pathname !== location.pathname ) {
			return;
		}
		const target = resolveAnchorTarget( a.hash );
		if ( target ) {
			requestAnimationFrame( () => watchAnchorLayoutShift( target ) );
		}
	} );
	const hashTarget = resolveAnchorTarget( location.hash );
	if ( hashTarget ) {
		requestAnimationFrame( () => watchAnchorLayoutShift( hashTarget ) );
	}
}
