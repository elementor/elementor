'use strict';

import {
	config as getConfig,
	skipInteraction,
	extractInteractionId,
	getAnimateFunction,
	getInViewFunction,
	waitForAnimateFunction,
	parseInteractionsData,
	unwrapInteractionValue,
	timingValueToMs,
	resetElementStyles,
} from './interactions-shared-utils.js';

export {
	getConfig as config,
	skipInteraction,
	extractInteractionId,
	getAnimateFunction,
	getInViewFunction,
	waitForAnimateFunction,
	parseInteractionsData,
	unwrapInteractionValue,
	timingValueToMs,
	resetElementStyles,
};

export function getKeyframes( effect, type, direction ) {
	const isIn = 'in' === type;
	const keyframes = {};

	if ( 'fade' === effect ) {
		keyframes.opacity = isIn ? [ 0, 1 ] : [ 1, 0 ];
	}

	const config = getConfig();

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
		,
		,
	] = name.split( '-' );

	const config = getConfig();

	return {
		trigger,
		effect,
		type,
		direction: direction || null,
		duration: duration ? parseInt( duration, 10 ) : config.defaultDuration,
		delay: delay ? parseInt( delay, 10 ) : config.defaultDelay,
		replay: false,
		easing: config.defaultEasing,
	};
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

export function findElementByDataId( dataId ) {
	return document.querySelector( `[data-interaction-id="${ dataId }"]` );
}

function unwrapInteractionBreakpoints( propValue ) {
	const breakpointsConfig = unwrapInteractionValue( propValue, {} );

	const excluded = unwrapInteractionValue( breakpointsConfig?.excluded, [] );

	if ( 1 > excluded.length ) {
		return {};
	}

	const breakpoints = {
		excluded: excluded.map( ( breakpoint ) => unwrapInteractionValue( breakpoint, '' ) ),
	};

	return breakpoints;
}

export function extractAnimationConfig( interaction ) {
	if ( 'string' === typeof interaction ) {
		return parseAnimationName( interaction );
	}

	const payload = ( 'interaction-item' === interaction?.$$type && interaction?.value ) ? interaction.value : interaction;
	if ( ! payload ) {
		return null;
	}

	if ( payload?.animation?.animation_id ) {
		return parseAnimationName( payload.animation.animation_id );
	}

	const trigger = unwrapInteractionValue( payload.trigger ) || payload.trigger || 'load';

	let animation = payload.animation;
	animation = unwrapInteractionValue( animation );

	if ( ! animation ) {
		return null;
	}

	const breakpoints = unwrapInteractionBreakpoints( payload.breakpoints );

	const config = getConfig();

	const effect = unwrapInteractionValue( animation.effect ) || animation.effect || 'fade';
	const type = unwrapInteractionValue( animation.type ) || animation.type || 'in';
	const direction = unwrapInteractionValue( animation.direction ) || animation.direction || '';
	const easing = config.defaultEasing;
	const replay = false;

	const timingConfig = unwrapInteractionValue( animation.timing_config ) || animation.timing_config || {};
	const duration = timingValueToMs( timingConfig?.duration, config.defaultDuration );
	const delay = timingValueToMs( timingConfig?.delay, config.defaultDelay );

	return {
		trigger,
		breakpoints,
		effect,
		type,
		direction,
		duration,
		delay,
		easing,
		replay,
	};
}
