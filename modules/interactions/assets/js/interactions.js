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
	resetElementStyles,
	shouldResetElementStyles,
} from './interactions-utils.js';

import { initBreakpoints } from './interactions-breakpoints.js';

function restoreElementStyles( element, transition, keyframes ) {
	element.style.transition = transition;

	// Clear the inline transform/opacity left behind once the animation reaches a
	// state that already matches the stylesheet default, so it does not mask
	// `:hover` (and manually authored) CSS on the same element.
	if ( shouldResetElementStyles( keyframes ) ) {
		requestAnimationFrame( () => {
			resetElementStyles( element );
			// ResetElementStyles also clears transition; restore it so an
			// authored inline transition is not removed by the cleanup.
			element.style.transition = transition;
		} );
	}
}

function scrollOutAnimation( element, transition, animConfig, keyframes, resetKeyframes, options, animateFunc, inViewFunc ) {
	const viewOptions = { amount: 0.85, root: null };

	animateFunc( element, resetKeyframes, { duration: 0 } );

	const stop = inViewFunc( element, () => {
		return () => {
			animateFunc( element, keyframes, options ).then( () => {
				element.style.transition = transition;
			} );
			if ( false === animConfig.replay ) {
				Promise.resolve().then( () => stop() );
			}
		};
	}, viewOptions );
}

function scrollInAnimation( element, transition, animConfig, keyframes, options, animateFunc, inViewFunc ) {
	const viewOptions = { amount: 0, root: null };
	const stop = inViewFunc( element, () => {
		animateFunc( element, keyframes, options ).then( () => {
			restoreElementStyles( element, transition, keyframes );
		} );
		if ( false === animConfig.replay ) {
			stop();
		}
	}, viewOptions );
}

function defaultAnimation( element, transition, keyframes, options, animateFunc ) {
	animateFunc( element, keyframes, options ).then( () => {
		restoreElementStyles( element, transition, keyframes );
	} );
}

function applyAnimation( element, animConfig, animateFunc, inViewFunc ) {
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
	if ( 'scrollOut' === animConfig.trigger ) {
		scrollOutAnimation( element, transition, animConfig, keyframes, resetKeyframes, options, animateFunc, inViewFunc );
	} else if ( 'scrollIn' === animConfig.trigger ) {
		scrollInAnimation( element, transition, animConfig, keyframes, options, animateFunc, inViewFunc );
	} else {
		defaultAnimation( element, transition, keyframes, options, animateFunc );
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
