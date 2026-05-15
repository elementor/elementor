'use strict';

import { getActiveBreakpoint } from './interactions-breakpoints.js';

export function config() {
	return window.ElementorInteractionsConfig?.constants ?? {};
}

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

export function resetElementStyles( element ) {
	if ( ! element ) {
		return;
	}

	element.style.transition = '';
	element.style.transform = '';
	element.style.opacity = '';
}

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
			// CSS matrix(a,b,c,d,e,f): x' = ax + cy + e, y' = bx + dy + f
			// matrixXfromY = how much input Y contributes to output X (etc.)
			const compactMatrix = {
				matrixXfromX: matrix.a ?? matrix.m11 ?? 1,
				matrixYfromX: matrix.b ?? matrix.m12 ?? 0,
				matrixXfromY: matrix.c ?? matrix.m21 ?? 0,
				matrixYfromY: matrix.d ?? matrix.m22 ?? 1,
				matrixTranslateX: matrix.e ?? matrix.m41 ?? 0,
				matrixTranslateY: matrix.f ?? matrix.m42 ?? 0,
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
		const [
			matrixXfromX,
			matrixYfromX,
			matrixXfromY,
			matrixYfromY,
			matrixTranslateX,
			matrixTranslateY,
		] = parsedValues;

		return {
			matrixXfromX,
			matrixYfromX,
			matrixXfromY,
			matrixYfromY,
			matrixTranslateX,
			matrixTranslateY,
		};
	}

	if ( 16 === parsedValues.length ) {
		const [
			matrixXfromX,
			matrixYfromX,
			,
			,
			matrixXfromY,
			matrixYfromY,
			,
			,
			,
			,
			,
			,
			matrixTranslateX,
			matrixTranslateY,
		] = parsedValues;

		return {
			matrixXfromX,
			matrixYfromX,
			matrixXfromY,
			matrixYfromY,
			matrixTranslateX,
			matrixTranslateY,
		};
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

	const {
		matrixXfromX,
		matrixYfromX,
		matrixXfromY,
		matrixYfromY,
		matrixTranslateX,
		matrixTranslateY,
	} = matrix;
	const scaleX = Math.hypot( matrixXfromX, matrixYfromX );
	const determinant = ( matrixXfromX * matrixYfromY ) - ( matrixYfromX * matrixXfromY );
	const scaleY = scaleX ? determinant / scaleX : Math.hypot( matrixXfromY, matrixYfromY );
	const rotate = radiansToDegrees( Math.atan2( matrixYfromX, matrixXfromX ) );
	const shear = scaleX
		? ( ( matrixXfromX * matrixXfromY ) + ( matrixYfromX * matrixYfromY ) ) / ( scaleX * scaleX )
		: 0;
	const skewX = radiansToDegrees( Math.atan( shear ) );

	return {
		x: matrixTranslateX,
		y: matrixTranslateY,
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
	resetElementStyles,
	getTransformBaselineFromComputedStyle,
	preserveTransformKeyframes,
};
