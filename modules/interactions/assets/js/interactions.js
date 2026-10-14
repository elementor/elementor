'use strict';

import {
	config,
	getKeyframes,
	getTransformBaselineFromComputedStyle,
	getOpacityBaselineFromComputedStyle,
	preserveTransformKeyframes,
	preserveOpacityKeyframes,
	skipInteraction,
	extractAnimationConfig,
	getAnimateFunction,
	getInViewFunction,
	waitForAnimateFunction,
	parseInteractionsData,
	shouldResetElementStyles,
} from './interactions-utils.js';

import { initBreakpoints } from './interactions-breakpoints.js';

// Inline transform/opacity the element had before any interaction touched it,
// and the opacity its stylesheet gives it.
const originalStyles = new WeakMap();
// The latest animation writing each style on the element. Motion.js stops an earlier
// animation of the same style when a new one starts, and a stopped animation never settles.
const styleOwners = new WeakMap();

function rememberOriginalStyles( element ) {
	if ( ! originalStyles.has( element ) ) {
		originalStyles.set( element, {
			transform: element.style.transform,
			opacity: element.style.opacity,
			baselineOpacity: getOpacityBaselineFromComputedStyle( element ),
		} );
	}
}

function getWrittenStyles( keyframes ) {
	const styles = [];

	if ( undefined !== keyframes.opacity ) {
		styles.push( 'opacity' );
	}

	if ( Object.keys( keyframes ).some( ( key ) => 'opacity' !== key ) ) {
		styles.push( 'transform' );
	}

	return styles;
}

function playAnimation( element, keyframes, options, animateFunc, restoreStyles ) {
	const animation = animateFunc( element, keyframes, options );
	const writtenStyles = getWrittenStyles( keyframes );
	const owners = styleOwners.get( element ) || {};

	styleOwners.set( element, owners );
	writtenStyles.forEach( ( style ) => {
		owners[ style ] = animation;
	} );

	const settle = () => {
		// A style a newer animation took over is not ours to restore.
		const ownedStyles = writtenStyles.filter( ( style ) => animation === owners[ style ] );

		ownedStyles.forEach( ( style ) => {
			owners[ style ] = null;
		} );

		restoreStyles( ownedStyles );
	};

	animation.then( settle, settle );
}

function restoreElementStyles( element, transition, keyframes, baseline, ownedStyles ) {
	element.style.transition = transition;

	const original = originalStyles.get( element );

	// Put back the inline transform/opacity the element had before the animation,
	// once it reaches a state that already matches the stylesheet, so the value
	// Motion.js leaves behind does not mask `:hover` (and manually authored) CSS.
	if ( ! shouldResetElementStyles( keyframes, baseline, original.baselineOpacity ) ) {
		return;
	}

	requestAnimationFrame( () => {
		const owners = styleOwners.get( element );

		ownedStyles.forEach( ( style ) => {
			// A newer animation started meanwhile and owns the style again.
			if ( ! owners[ style ] ) {
				element.style[ style ] = original[ style ];
			}
		} );
	} );
}

function scrollOutAnimation( element, restoreStyles, animConfig, keyframes, resetKeyframes, options, animateFunc, inViewFunc ) {
	const viewOptions = { amount: 0.85, root: null };

	animateFunc( element, resetKeyframes, { duration: 0 } );

	const stop = inViewFunc( element, () => {
		return () => {
			playAnimation( element, keyframes, options, animateFunc, restoreStyles );
			if ( false === animConfig.replay ) {
				Promise.resolve().then( () => stop() );
			}
		};
	}, viewOptions );
}

function scrollInAnimation( element, restoreStyles, animConfig, keyframes, options, animateFunc, inViewFunc ) {
	const viewOptions = { amount: 0, root: null };
	const stop = inViewFunc( element, () => {
		playAnimation( element, keyframes, options, animateFunc, restoreStyles );
		if ( false === animConfig.replay ) {
			stop();
		}
	}, viewOptions );
}

function defaultAnimation( element, restoreStyles, keyframes, options, animateFunc ) {
	playAnimation( element, keyframes, options, animateFunc, restoreStyles );
}

function applyAnimation( element, animConfig, animateFunc, inViewFunc ) {
	rememberOriginalStyles( element );

	const { baselineOpacity } = originalStyles.get( element );
	const baseline = getTransformBaselineFromComputedStyle( element );
	const keyframes = preserveOpacityKeyframes(
		preserveTransformKeyframes(
			getKeyframes( animConfig.effect, animConfig.type, animConfig.direction ),
			baseline,
		),
		baselineOpacity,
	);
	const resetKeyframes = preserveOpacityKeyframes(
		preserveTransformKeyframes(
			getKeyframes( animConfig.effect, 'in', animConfig.direction ),
			baseline,
		),
		baselineOpacity,
	);

	const options = {
		duration: animConfig.duration / 1000,
		delay: animConfig.delay / 1000,
		ease: config().defaultEasing,
	};

	// WHY - Transition can be set on elements but once it sets it destroys all animations, so we basically put it aside.
	const transition = element.style.transition;
	element.style.transition = 'none';
	const restoreStyles = ( ownedStyles ) => restoreElementStyles( element, transition, keyframes, baseline, ownedStyles );

	if ( 'scrollOut' === animConfig.trigger ) {
		scrollOutAnimation( element, restoreStyles, animConfig, keyframes, resetKeyframes, options, animateFunc, inViewFunc );
	} else if ( 'scrollIn' === animConfig.trigger ) {
		scrollInAnimation( element, restoreStyles, animConfig, keyframes, options, animateFunc, inViewFunc );
	} else {
		defaultAnimation( element, restoreStyles, keyframes, options, animateFunc );
	}
}

function processElementInteractions( element, interactions, animateFunc, inViewFunc ) {
	if ( ! interactions || ! Array.isArray( interactions ) ) {
		return;
	}

	interactions.forEach( ( interaction ) => {
		const animConfig = extractAnimationConfig( interaction );

		if ( animConfig && ! skipInteraction( animConfig ) ) {
			applyAnimation( element, animConfig, animateFunc, inViewFunc );
		}
	} );
}

function initInteractions() {
	waitForAnimateFunction( () => {
		const animateFunc = getAnimateFunction();
		const inViewFunc = getInViewFunction();

		if ( ! inViewFunc || ! animateFunc ) {
			return;
		}

		// New method: Read centralized interactions data from script tag
		const dataScript = document.getElementById( 'elementor-interactions-data' );
		if ( dataScript ) {
			const elementsData = JSON.parse( dataScript.textContent );

			elementsData.forEach( ( elementData ) => {
				const { elementId, interactions } = elementData;

				if ( ! elementId || ! interactions || ! Array.isArray( interactions ) ) {
					return;
				}

				document.querySelectorAll( `[data-interaction-id="${ elementId }"]` ).forEach( ( element ) => {
					processElementInteractions( element, interactions, animateFunc, inViewFunc );
				} );
			} );

			return;
		}

		// Legacy fallback: parse data-interactions attributes
		const elements = document.querySelectorAll( '[data-interactions]' );

		elements.forEach( ( element ) => {
			const interactionsData = element.getAttribute( 'data-interactions' );
			const parsedData = parseInteractionsData( interactionsData );

			processElementInteractions( element, parsedData, animateFunc, inViewFunc );
		} );
	} );
}

function init() {
	initBreakpoints();
	initInteractions();
}

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}
