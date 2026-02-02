'use strict';

export const config = window.ElementorInteractionsConfig?.constants || {
	defaultDuration: 300,
	defaultDelay: 0,
	slideDistance: 100,
	scaleStart: 0,
	defaultEasing: 'easeIn',
};

export function getKeyframes( effect, type, direction ) {
	const isIn = 'in' === type;
	const keyframes = {};

	if ( 'fade' === effect ) {
		keyframes.opacity = isIn ? [ 0, 1 ] : [ 1, 0 ];
	}

	if ( 'scale' === effect ) {
		keyframes.scale = isIn ? [ config.scaleStart, 1 ] : [ 1, config.scaleStart ];
	}

	if ( direction ) {
		const distance = config.slideDistance;
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
	const [
		trigger,
		effect,
		type,
		direction,
		duration,
		delay,
		replay,
		easing,
	] = name.split( '-' );

	return {
		trigger,
		effect,
		type,
		direction: direction || '',
		duration: duration ? parseInt( duration, 10 ) : config.defaultDuration,
		delay: delay ? parseInt( delay, 10 ) : config.defaultDelay,
		replay: 'true' === replay,
		easing: easing || config.defaultEasing,
	};
}

export function extractAnimationId( interaction ) {
	if ( 'string' === typeof interaction ) {
		return interaction;
	}

	if ( 'interaction-item' === interaction?.$$type && interaction?.value ) {
		const { trigger, animation } = interaction.value;

		if ( 'animation-preset-props' === animation?.$$type && animation?.value ) {
			const { effect, type, direction, timing_config: timingConfig, config: animationConfig } = animation.value;

			const triggerVal = trigger?.value || 'load';
			const effectVal = effect?.value || 'fade';
			const typeVal = type?.value || 'in';
			const directionVal = direction?.value || '';

			const duration = timingConfig?.value?.duration?.value ?? 300;
			const delay = timingConfig?.value?.delay?.value ?? 0;

			const easing = animationConfig?.value?.easing?.value || config.defaultEasing;

			return [
				triggerVal,
				effectVal,
				typeVal,
				directionVal,
				duration,
				delay,
				'',
				easing,
			].join( '-' );
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

export function waitForAnimateFunction( callback, maxAttempts = 10 ) {
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

/**
 * Get interactions data from the script tag injected by PHP.
 * Returns array of { elementId, dataId, interactions: [...] }
 */
export function getInteractionsData() {
	const scriptTag = document.getElementById( 'elementor-interactions-data' );
	if ( ! scriptTag ) {
		return null;
	}

	try {
		return JSON.parse( scriptTag.textContent );
	} catch {
		return null;
	}
}

/**
 * Find an Elementor element by its data-id attribute.
 */
export function findElementByDataId( dataId ) {
	return document.querySelector( `[data-interaction-id="${ dataId }"]` );
}

/**
 * Extract animation config from a cleaned interaction object (no $$type wrappers).
 * Returns an object with trigger, effect, type, direction, duration, delay, easing, replay.
 */
export function extractAnimationConfig( interaction ) {
	if ( ! interaction || ! interaction.animation ) {
		return null;
	}

	const { trigger, animation } = interaction;

	// Handle cleaned format (no $$type)
	const effect = animation.effect || 'fade';
	const type = animation.type || 'in';
	const direction = animation.direction || '';

	// timing_config can have size objects: { size: 300, unit: 'ms' } or plain numbers
	const timingConfig = animation.timing_config || {};
	const duration = extractNumericValue( timingConfig.duration, config.defaultDuration );
	const delay = extractNumericValue( timingConfig.delay, config.defaultDelay );

	// config contains replay, easing, etc.
	const animConfig = animation.config || {};
	const easing = animConfig.easing || config.defaultEasing;
	const replay = animConfig.replay ?? false;

	return {
		trigger: trigger || 'load',
		effect,
		type,
		direction,
		duration,
		delay,
		easing,
		replay,
	};
}

/**
 * Extract numeric value from a value that can be:
 * - A plain number: 300
 * - A size object: { size: 300, unit: 'ms' }
 */
function extractNumericValue( value, defaultValue = 0 ) {
	if ( typeof value === 'number' ) {
		return value;
	}
	if ( value && typeof value === 'object' && 'size' in value ) {
		return value.size;
	}
	return defaultValue;
}
