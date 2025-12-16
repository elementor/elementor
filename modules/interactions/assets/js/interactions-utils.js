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

	switch ( direction ) {
		case 'left':
			return viewportWidth + rect.width;
		case 'right':
			return viewportWidth + rect.width;
		case 'top':
			return viewportHeight + rect.height;
		case 'bottom':
			return viewportHeight + rect.height;
		default:
			return config.slideDistance;
	}
}

export function getKeyframes( effect, type, direction, element = null ) {
	const isIn = 'in' === type;
	const keyframes = {};

	if ( 'fade' === effect ) {
		keyframes.opacity = isIn ? [ 0, 1 ] : [ 1, 0 ];
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

		if ( 'fade' !== effect ) {
			keyframes.opacity = isIn ? [ 0, 1 ] : [ 1, 0 ];
		}
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

