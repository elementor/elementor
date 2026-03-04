'use strict';

import { getActiveBreakpoint } from './interactions-breakpoints.js';

export const config = window.ElementorInteractionsConfig?.constants || {
	defaultDuration: 600,
	defaultDelay: 0,
	slideDistance: 100,
	scaleStart: 0,
	defaultEasing: 'easeIn',
	relativeTo: 'viewport',
	start: 85,
	end: 15,
};

export function skipInteraction( interaction ) {
	const breakpoint = getActiveBreakpoint();
	return interaction?.breakpoints?.excluded?.includes( breakpoint );
}

export function extractInteractionId( interaction ) {
	if ( 'interaction-item' === interaction?.$$type && interaction?.value ) {
		return interaction.value.interaction_id?.value || null;
	}
	return null;
}

function motionFunc( name ) {
	if ( 'function' !== typeof window?.Motion?.[ name ] ) {
		return undefined;
	}
	return window?.Motion?.[ name ];
}

export function getAnimateFunction() {
	return motionFunc( 'animate' );
}

export function getInViewFunction() {
	return motionFunc( 'inView' );
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

export function unwrapInteractionValue( propValue, fallback = null ) {
	// Supports Elementor's typed wrapper shape: { $$type: '...', value: ... }.
	if ( propValue && 'object' === typeof propValue && '$$type' in propValue ) {
		return propValue.value;
	}

	return propValue ?? fallback;
}

export function timingValueToMs( timingValue, fallbackMs ) {
	if ( null === timingValue || undefined === timingValue ) {
		return fallbackMs;
	}

	const unwrapped = unwrapInteractionValue( timingValue );

	if ( 'number' === typeof unwrapped ) {
		return unwrapped;
	}

	const sizeObj = unwrapInteractionValue( unwrapped );
	const size = sizeObj?.size;
	const unit = sizeObj?.unit || 'ms';

	if ( 'number' !== typeof size ) {
		return fallbackMs;
	}

	if ( 's' === unit ) {
		return size * 1000;
	}

	return size;
}

// Expose on elementorModules for Pro and other consumers.
window.elementorModules = window.elementorModules || {};
window.elementorModules.interactions = {
	config,
	skipInteraction,
	extractInteractionId,
	getAnimateFunction,
	getInViewFunction,
	waitForAnimateFunction,
	parseInteractionsData,
	unwrapInteractionValue,
	timingValueToMs,
};
