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

const TRANSFORM_EPSILON = 0.001;

const radiansToDegrees = ( radians ) => radians * ( 180 / Math.PI );

const isNear = ( value, expected ) => Math.abs( value - expected ) <= TRANSFORM_EPSILON;

const isNearZero = ( value ) => isNear( value, 0 );

const isNearOne = ( value ) => isNear( value, 1 );

function parseMatrixValues( transformValue ) {
	const match = transformValue.match( /^matrix(3d)?\((.+)\)$/ );

	if ( ! match ) {
		return null;
	}

	return match[ 2 ]
		.split( ',' )
		.map( ( token ) => Number.parseFloat( token.trim() ) )
		.filter( ( value ) => Number.isFinite( value ) );
}

function createMatrixFromTransform( transformValue ) {
	if ( ! transformValue || 'none' === transformValue ) {
		return null;
	}

	const matrixFactories = [ window.DOMMatrixReadOnly, window.DOMMatrix ].filter(
		( Factory ) => 'function' === typeof Factory,
	);

	for ( const MatrixFactory of matrixFactories ) {
		try {
			const matrix = new MatrixFactory( transformValue );
			const compactMatrix = {
				a: matrix.a ?? matrix.m11 ?? 1,
				b: matrix.b ?? matrix.m12 ?? 0,
				c: matrix.c ?? matrix.m21 ?? 0,
				d: matrix.d ?? matrix.m22 ?? 1,
				e: matrix.e ?? matrix.m41 ?? 0,
				f: matrix.f ?? matrix.m42 ?? 0,
			};

			if ( Object.values( compactMatrix ).every( Number.isFinite ) ) {
				return compactMatrix;
			}
		} catch {}
	}

	const parsedValues = parseMatrixValues( transformValue );

	if ( ! parsedValues ) {
		return null;
	}

	if ( 6 === parsedValues.length ) {
		const [ a, b, c, d, e, f ] = parsedValues;

		return { a, b, c, d, e, f };
	}

	if ( 16 === parsedValues.length ) {
		const [ a, b, , , c, d, , , , , , , e, f ] = parsedValues;

		return { a, b, c, d, e, f };
	}

	return null;
}

export function getTransformBaselineFromComputedStyle( element ) {
	if ( ! element ) {
		return null;
	}

	const computedStyle = window.getComputedStyle( element );
	const matrix = createMatrixFromTransform( computedStyle?.transform || '' );

	if ( ! matrix ) {
		return null;
	}

	const { a, b, c, d, e, f } = matrix;
	const scaleX = Math.hypot( a, b );
	const determinant = ( a * d ) - ( b * c );
	const scaleY = scaleX ? determinant / scaleX : Math.hypot( c, d );
	const rotate = radiansToDegrees( Math.atan2( b, a ) );
	const shear = scaleX ? ( ( a * c ) + ( b * d ) ) / ( scaleX * scaleX ) : 0;
	const skewX = radiansToDegrees( Math.atan( shear ) );

	return {
		x: e,
		y: f,
		scaleX: Number.isFinite( scaleX ) ? scaleX : 1,
		scaleY: Number.isFinite( scaleY ) ? scaleY : 1,
		rotate: Number.isFinite( rotate ) ? rotate : 0,
		skewX: Number.isFinite( skewX ) ? skewX : 0,
	};
}

export function preserveTransformKeyframes( keyframes, baseline ) {
	if ( ! baseline ) {
		return keyframes;
	}

	const mergedKeyframes = { ...keyframes };
	const hasScaleShorthand = mergedKeyframes.scale !== undefined;
	const canSetScaleX = mergedKeyframes.scaleX === undefined && ! isNearOne( baseline.scaleX );
	const canSetScaleY = mergedKeyframes.scaleY === undefined && ! isNearOne( baseline.scaleY );

	if ( mergedKeyframes.x === undefined && ! isNearZero( baseline.x ) ) {
		mergedKeyframes.x = [ baseline.x, baseline.x ];
	}

	if ( mergedKeyframes.y === undefined && ! isNearZero( baseline.y ) ) {
		mergedKeyframes.y = [ baseline.y, baseline.y ];
	}

	if ( ! hasScaleShorthand ) {
		if ( canSetScaleX && canSetScaleY && isNear( baseline.scaleX, baseline.scaleY ) ) {
			mergedKeyframes.scale = [ baseline.scaleX, baseline.scaleX ];
		} else {
			if ( canSetScaleX ) {
				mergedKeyframes.scaleX = [ baseline.scaleX, baseline.scaleX ];
			}

			if ( canSetScaleY ) {
				mergedKeyframes.scaleY = [ baseline.scaleY, baseline.scaleY ];
			}
		}
	}

	if (
		mergedKeyframes.rotate === undefined &&
		mergedKeyframes.rotateZ === undefined &&
		! isNearZero( baseline.rotate )
	) {
		mergedKeyframes.rotate = [ baseline.rotate, baseline.rotate ];
	}

	if (
		mergedKeyframes.skew === undefined &&
		mergedKeyframes.skewX === undefined &&
		! isNearZero( baseline.skewX )
	) {
		mergedKeyframes.skewX = [ baseline.skewX, baseline.skewX ];
	}

	return mergedKeyframes;
}

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

	if ( direction && 'string' === typeof direction ) {
		const distance = config.slideDistance;
		const movement = {
			left: { x: isIn ? [ -distance, 0 ] : [ 0, -distance ] },
			right: { x: isIn ? [ distance, 0 ] : [ 0, distance ] },
			top: { y: isIn ? [ -distance, 0 ] : [ 0, -distance ] },
			bottom: { y: isIn ? [ distance, 0 ] : [ 0, distance ] },
		};

		direction.split( '-' ).forEach( ( part ) => {
			if ( movement[ part ] ) {
				Object.assign( keyframes, movement[ part ] );
			}
		} );
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
	const directionUnwrapped = unwrapInteractionValue( animation.direction );
	const direction = 'string' === typeof directionUnwrapped ? directionUnwrapped : '';
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
