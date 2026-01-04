'use strict';

export const config = window.ElementorInteractionsConfig?.constants || {
	defaultDuration: 300,
	defaultDelay: 0,
	slideDistance: 100,
	scaleStart: 0,
	easing: 'linear',
};

function calculateSlideDistance( element, direction ) {
	if ( ! element ) {
		return config.slideDistance;
	}

	const rect = element.getBoundingClientRect();
	const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
	const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
	const isLtr = 'ltr' === document.documentElement.dir || 'ltr' === document.body.dir;

	switch ( direction ) {
		case 'left':
			return Math.min( ( isLtr ? rect.left : rect.right ) + rect.width, viewportWidth + rect.width );
		case 'right':
			return Math.min( viewportWidth - ( isLtr ? rect.right : rect.left ) + rect.width, viewportWidth + rect.width );
		case 'top':
			return Math.min( rect.top + rect.height, viewportHeight + rect.height );
		case 'bottom':
			return Math.min( viewportHeight - rect.bottom + rect.height, viewportHeight + rect.height );
		default:
			return config.slideDistance;
	}
}

export function getKeyframes( effect, type, direction, element = null ) {
	const isIn = 'in' === type;
	const keyframes = {};
	const hasDirection = !! direction;

	if ( 'fade' === effect ) {
		if ( hasDirection && isIn ) {
			keyframes.opacity = [ 0, 0, 0.2, 0.6, 1 ];
		} else if ( hasDirection && ! isIn ) {
			keyframes.opacity = [ 1, 0.8, 0.4, 0, 0 ];
		} else {
			keyframes.opacity = isIn ? [ 0, 1 ] : [ 1, 0 ];
		}
	}

	if ( 'scale' === effect ) {
		keyframes.scale = isIn ? [ config.scaleStart, 1 ] : [ 1, config.scaleStart ];
	}

	if ( direction ) {
		const distance = calculateSlideDistance( element, direction );
		const movement = {
			left: { x: isIn ? [ -distance, 0 ] : [ 0, -distance ] },
			right: { x: isIn ? [ distance, 0 ] : [ 0, distance ] },
			top: { y: isIn ? [ -distance, 0 ] : [ 0, -distance ] },
			bottom: { y: isIn ? [ distance, 0 ] : [ 0, distance ] },
		};

		Object.assign( keyframes, movement[ direction ] );
	}

	return keyframes;
}

export function parseAnimationName( name ) {
	const [ trigger, effect, type, direction, duration, delay ] = name.split( '-' );

	return {
		trigger,
		effect,
		type,
		direction: direction || null,
		duration: duration ? parseInt( duration, 10 ) : config.defaultDuration,
		delay: delay ? parseInt( delay, 10 ) : config.defaultDelay,
	};
}

