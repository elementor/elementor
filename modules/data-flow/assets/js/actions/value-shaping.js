const FRAMES_PER_SECOND = 60;
const EPSILON = 0.001;
const DEFAULT_SPRING = { stiffness: 170, damping: 26, mass: 1 };
const MAX_STEP_SECONDS = 1 / 20;

export function mapRange( value, [ inMin, inMax, outMin, outMax ], clamp = true ) {
	if ( inMin === inMax ) {
		return outMin;
	}

	const progress = ( value - inMin ) / ( inMax - inMin );
	const clampedProgress = clamp ? Math.min( 1, Math.max( 0, progress ) ) : progress;

	return outMin + ( ( outMax - outMin ) * clampedProgress );
}

function perFrame( factor, dt ) {
	return Math.pow( factor, dt * FRAMES_PER_SECOND );
}

function isNear( a, b ) {
	return Math.abs( a - b ) < EPSILON;
}

function createEnvelope( decay ) {
	let level = 0;

	return {
		get level() {
			return level;
		},
		step( input, dt ) {
			if ( ! decay || Math.abs( input ) >= Math.abs( level ) ) {
				level = input;
				return false;
			}

			level *= perFrame( decay, dt );

			if ( isNear( level, input ) ) {
				level = input;
				return false;
			}

			return true;
		},
	};
}

function createFollower( spec, initial ) {
	let value = initial;
	let velocity = 0;

	const spring = spec.spring ? { ...DEFAULT_SPRING, ...spec.spring } : null;

	const settle = ( target ) => {
		value = target;
		velocity = 0;
		return false;
	};

	return {
		get value() {
			return value;
		},
		step( target, dt ) {
			if ( spring ) {
				const force = ( -spring.stiffness * ( value - target ) ) - ( spring.damping * velocity );
				velocity += ( force / spring.mass ) * dt;
				value += velocity * dt;

				return isNear( value, target ) && Math.abs( velocity ) < EPSILON ? settle( target ) : true;
			}

			if ( spec.smooth ) {
				value += ( target - value ) * ( 1 - perFrame( spec.smooth, dt ) );

				return isNear( value, target ) ? settle( target ) : true;
			}

			return settle( target );
		},
	};
}

export function createChannel( spec = {}, initial = 0 ) {
	const envelope = createEnvelope( spec.decay );
	const follower = createFollower( spec, initial );
	let rawTarget = 0;

	const toTarget = ( raw ) => ( spec.map ? mapRange( raw, spec.map, false !== spec.clamp ) : raw );

	return {
		get value() {
			return follower.value;
		},
		setTarget( raw ) {
			rawTarget = raw;
		},
		step( dt ) {
			const safeDt = Math.min( dt, MAX_STEP_SECONDS );
			const releasing = envelope.step( rawTarget, safeDt );
			const following = follower.step( toTarget( envelope.level ), safeDt );

			return releasing || following;
		},
	};
}
