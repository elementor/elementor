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

export function extractAnimationId( interaction ) {
	if ( 'string' === typeof interaction ) {
		return interaction;
	}

	if ( 'interaction-item' === interaction?.$$type && interaction?.value ) {
		const { trigger, animation } = interaction.value;
		if ( 'animation-preset-props' === animation?.$$type && animation?.value ) {
			const { effect, type, direction, timing_config: timingConfig } = animation.value;
			const triggerVal = trigger?.value || 'load';
			const effectVal = effect?.value || 'fade';
			const typeVal = type?.value || 'in';
			const directionVal = direction?.value || '';
			const duration = timingConfig?.value?.duration?.value ?? 300;
			const delay = timingConfig?.value?.delay?.value ?? 0;
			return `${ triggerVal }-${ effectVal }-${ typeVal }-${ directionVal }-${ duration }-${ delay }`;
		}
	}

	if ( interaction?.animation?.animation_id ) {
		return interaction.animation.animation_id;
	}

	return null;
}

export function extractInteractionId( interaction ) {
	if ( 'interaction-item' === interaction?.$$type && interaction?.value ) {
		return interaction.value.interaction_id?.value || null;
	}
	return null;
}

export function getAnimateFunction() {
	return 'undefined' !== typeof animate ? animate : window.Motion?.animate;
}

export function getInViewFunction() {
	return 'undefined' !== typeof inView ? inView : window.Motion?.inView;
}

export function waitForAnimateFunction( callback, maxAttempts = 50 ) {
	if ( getAnimateFunction() ) {
		callback();
		return;
	}

	if ( maxAttempts > 0 ) {
		setTimeout( () => waitForAnimateFunction( callback, maxAttempts - 1 ), 100 );
	}
}

export function parseInteractionsData( data ) {
	if ( 'string' === typeof data ) {
		try {
			return JSON.parse( data );
		} catch {
			return null;
		}
	}
	return data;
}