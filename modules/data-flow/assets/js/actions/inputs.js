const SPACE_LOCAL = 'local';
const EPSILON = 0.01;
const DEFAULT_INERTIA = 0.95;
const VELOCITY_SMOOTHING = 0.5;
const DEGREES_PER_RADIAN = 180 / Math.PI;

function normalize( offset, size ) {
	return size ? ( ( offset / size ) * 2 ) - 1 : 0;
}

function listen( target, type, listener, options ) {
	target.addEventListener( type, listener, options );

	return () => target.removeEventListener( type, listener, options );
}

/*
 * Pointer position. Global space tracks the viewport; local space tracks the element bounds and returns to
 * rest (0, 0) when the pointer leaves, so springs ease back.
 * Values: x, y (-1..1), px, py (pixels), inside (1 | 0).
 */
function createPointerInput( element, { space }, { win, wake } ) {
	const isLocal = SPACE_LOCAL === space;
	const sample = { x: 0, y: 0, px: 0, py: 0, inside: 0 };
	let dirty = false;

	const onMove = ( event ) => {
		const rect = isLocal
			? element.getBoundingClientRect()
			: { left: 0, top: 0, width: win.innerWidth, height: win.innerHeight };

		sample.px = event.clientX - rect.left;
		sample.py = event.clientY - rect.top;
		sample.x = normalize( sample.px, rect.width );
		sample.y = normalize( sample.py, rect.height );
		sample.inside = 1;
		dirty = true;
		wake();
	};

	const onLeave = () => {
		Object.assign( sample, { x: 0, y: 0, inside: 0 } );
		dirty = true;
		wake();
	};

	const cleanups = isLocal
		? [ listen( element, 'pointermove', onMove ), listen( element, 'pointerleave', onLeave ) ]
		: [ listen( win, 'pointermove', onMove, { passive: true } ) ];

	return {
		read() {
			const changed = dirty;
			dirty = false;

			return { sample, changed };
		},
		destroy: () => cleanups.forEach( ( cleanup ) => cleanup() ),
	};
}

/*
 * Scroll position and velocity. Global space tracks the document; local space tracks the element's
 * progress through the viewport (0 entering at the bottom, 1 leaving at the top).
 * Values: y (pixels), progress (0..1), velocity (px/s, signed), speed (px/s).
 */
function createScrollInput( element, { space }, { win, doc, wake } ) {
	const isLocal = SPACE_LOCAL === space;
	const sample = { y: 0, progress: 0, velocity: 0, speed: 0 };
	let lastY = win.scrollY;

	const readProgress = () => {
		if ( ! isLocal ) {
			const max = doc.documentElement.scrollHeight - win.innerHeight;

			return max > 0 ? win.scrollY / max : 0;
		}

		const rect = element.getBoundingClientRect();
		const distance = win.innerHeight + rect.height;

		return distance > 0 ? Math.min( 1, Math.max( 0, ( win.innerHeight - rect.top ) / distance ) ) : 0;
	};

	const cleanup = listen( win, 'scroll', wake, { passive: true } );

	return {
		read( dt ) {
			const y = win.scrollY;
			const velocity = dt > 0 ? ( y - lastY ) / dt : 0;

			lastY = y;
			Object.assign( sample, { y, progress: readProgress(), velocity, speed: Math.abs( velocity ) } );

			return { sample, changed: 0 !== velocity };
		},
		destroy: cleanup,
	};
}

/*
 * Pointer drag with optional inertia after release.
 * Values: x, y (accumulated pixels), angle (accumulated degrees around the element center),
 * velocity (deg/s of the angle), dragging (1 | 0).
 */
function createDragInput( element, { inertia = DEFAULT_INERTIA }, { wake } ) {
	const sample = { x: 0, y: 0, angle: 0, velocity: 0, dragging: 0 };
	const velocity = { x: 0, y: 0, angle: 0 };
	const pending = { x: 0, y: 0, angle: 0 };
	let last = null;

	const pointerAngle = ( event ) => {
		const rect = element.getBoundingClientRect();

		return Math.atan2( event.clientY - ( rect.top + ( rect.height / 2 ) ), event.clientX - ( rect.left + ( rect.width / 2 ) ) ) * DEGREES_PER_RADIAN;
	};

	const onDown = ( event ) => {
		element.setPointerCapture?.( event.pointerId );
		last = { x: event.clientX, y: event.clientY, angle: pointerAngle( event ) };
		Object.assign( velocity, { x: 0, y: 0, angle: 0 } );
		sample.dragging = 1;
		wake();
	};

	const onMove = ( event ) => {
		if ( ! last ) {
			return;
		}

		const angle = pointerAngle( event );
		let angleDelta = angle - last.angle;

		if ( angleDelta > 180 ) {
			angleDelta -= 360;
		} else if ( angleDelta < -180 ) {
			angleDelta += 360;
		}

		pending.x += event.clientX - last.x;
		pending.y += event.clientY - last.y;
		pending.angle += angleDelta;
		last = { x: event.clientX, y: event.clientY, angle };
		wake();
	};

	const onUp = () => {
		last = null;
		sample.dragging = 0;
		wake();
	};

	element.style.touchAction = 'none';

	const cleanups = [
		listen( element, 'pointerdown', onDown ),
		listen( element, 'pointermove', onMove ),
		listen( element, 'pointerup', onUp ),
		listen( element, 'pointercancel', onUp ),
	];

	return {
		read( dt ) {
			const keys = [ 'x', 'y', 'angle' ];

			if ( sample.dragging ) {
				keys.forEach( ( key ) => {
					const instant = dt > 0 ? pending[ key ] / dt : 0;
					velocity[ key ] = ( velocity[ key ] * VELOCITY_SMOOTHING ) + ( instant * ( 1 - VELOCITY_SMOOTHING ) );
					sample[ key ] += pending[ key ];
					pending[ key ] = 0;
				} );
			} else {
				const friction = Math.pow( inertia, dt * 60 );

				keys.forEach( ( key ) => {
					velocity[ key ] = Math.abs( velocity[ key ] ) < EPSILON ? 0 : velocity[ key ] * friction;
					sample[ key ] += velocity[ key ] * dt;
				} );
			}

			sample.velocity = velocity.angle;

			const moving = keys.some( ( key ) => 0 !== velocity[ key ] );

			return { sample, changed: Boolean( sample.dragging ) || moving };
		},
		destroy: () => cleanups.forEach( ( cleanup ) => cleanup() ),
	};
}

/*
 * Elapsed time, only advancing while the element is on screen.
 * Values: t (seconds).
 */
function createTimeInput( element, options, { win, wake } ) {
	const sample = { t: 0 };
	let visible = true;
	let observer = null;

	if ( win.IntersectionObserver ) {
		observer = new win.IntersectionObserver( ( [ entry ] ) => {
			visible = entry.isIntersecting;
			wake();
		} );
		observer.observe( element );
	}

	return {
		read( dt ) {
			if ( visible ) {
				sample.t += dt;
			}

			return { sample, changed: visible };
		},
		destroy: () => observer?.disconnect(),
	};
}

export const INPUTS = {
	pointer: createPointerInput,
	scroll: createScrollInput,
	drag: createDragInput,
	time: createTimeInput,
};

export function createInput( type, element, options, env ) {
	const factory = INPUTS[ type ];

	return factory ? factory( element, options, env ) : null;
}
