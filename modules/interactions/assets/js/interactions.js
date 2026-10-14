'use strict';

import {
	config,
	getKeyframes,
	getTransformBaselineFromComputedStyle,
	preserveTransformKeyframes,
	skipInteraction,
	extractAnimationConfig,
	getAnimateFunction,
	getInViewFunction,
	waitForAnimateFunction,
	parseInteractionsData,
	shouldResetElementStyles,
} from './interactions-utils.js';

import { initBreakpoints } from './interactions-breakpoints.js';

// Inline transform/opacity the element had before any interaction touched it.
const originalInlineStyles = new WeakMap();
// Number of interaction animations currently running on the element.
const runningAnimations = new WeakMap();

function rememberInlineStyles( element ) {
	if ( ! originalInlineStyles.has( element ) ) {
		originalInlineStyles.set( element, {
			transform: element.style.transform,
			opacity: element.style.opacity,
		} );
	}
}

function playAnimation( element, keyframes, options, animateFunc ) {
	const animation = animateFunc( element, keyframes, options );
	const finish = () => runningAnimations.set( element, runningAnimations.get( element ) - 1 );

	runningAnimations.set( element, ( runningAnimations.get( element ) || 0 ) + 1 );
	// Registered before the caller's `.then`, so the count is already updated when it runs.
	animation.then( finish, finish );

	return animation;
}

function restoreElementStyles( element, transition, keyframes, baseline ) {
	element.style.transition = transition;

	// Put back the inline transform/opacity the element had before the animation,
	// once it reaches a state that already matches the stylesheet, so the value
	// Motion.js leaves behind does not mask `:hover` (and manually authored) CSS.
	if ( ! shouldResetElementStyles( keyframes, baseline ) ) {
		return;
	}

	// Only touch what this animation wrote, so a style another interaction committed stays.
	const wroteOpacity = undefined !== keyframes.opacity;
	const wroteTransform = Object.keys( keyframes ).some( ( key ) => 'opacity' !== key );

	requestAnimationFrame( () => {
		// A running animation still owns the inline styles. Wiping them now would make it jump.
		if ( runningAnimations.get( element ) > 0 ) {
			return;
		}

		const { transform, opacity } = originalInlineStyles.get( element );

		if ( wroteTransform ) {
			element.style.transform = transform;
		}

		if ( wroteOpacity ) {
			element.style.opacity = opacity;
		}
	} );
}

function scrollOutAnimation( element, restoreStyles, animConfig, keyframes, resetKeyframes, options, animateFunc, inViewFunc ) {
	const viewOptions = { amount: 0.85, root: null };

	animateFunc( element, resetKeyframes, { duration: 0 } );

	const stop = inViewFunc( element, () => {
		return () => {
			playAnimation( element, keyframes, options, animateFunc ).then( restoreStyles );
			if ( false === animConfig.replay ) {
				Promise.resolve().then( () => stop() );
			}
		};
	}, viewOptions );
}

function scrollInAnimation( element, restoreStyles, animConfig, keyframes, options, animateFunc, inViewFunc ) {
	const viewOptions = { amount: 0, root: null };
	const stop = inViewFunc( element, () => {
		playAnimation( element, keyframes, options, animateFunc ).then( restoreStyles );
		if ( false === animConfig.replay ) {
			stop();
		}
	}, viewOptions );
}

function defaultAnimation( element, restoreStyles, keyframes, options, animateFunc ) {
	playAnimation( element, keyframes, options, animateFunc ).then( restoreStyles );
}

function applyAnimation( element, animConfig, animateFunc, inViewFunc ) {
	rememberInlineStyles( element );

	const baseline = getTransformBaselineFromComputedStyle( element );
	const keyframes = preserveTransformKeyframes(
		getKeyframes( animConfig.effect, animConfig.type, animConfig.direction ),
		baseline,
	);
	const resetKeyframes = preserveTransformKeyframes(
		getKeyframes( animConfig.effect, 'in', animConfig.direction ),
		baseline,
	);

	const options = {
		duration: animConfig.duration / 1000,
		delay: animConfig.delay / 1000,
		ease: config().defaultEasing,
	};

	// WHY - Transition can be set on elements but once it sets it destroys all animations, so we basically put it aside.
	const transition = element.style.transition;
	element.style.transition = 'none';
	const restoreStyles = () => restoreElementStyles( element, transition, keyframes, baseline );

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
