import {
	config,
	getKeyframes,
	extractAnimationConfig,
	getAnimateFunction,
	getInViewFunction,
	waitForAnimateFunction,
	parseInteractionsData,
} from './interactions-utils.js';

import { initBreakpoints, getActiveBreakpoint } from './interactions-breakpoints.js';

function scrollOutAnimation( element, transition, animConfig, keyframes, options, animateFunc, inViewFunc ) {
	const viewOptions = { amount: 0.85, root: null };
	const resetKeyframes = getKeyframes( animConfig.effect, 'in', animConfig.direction );

	animateFunc( element, resetKeyframes, { duration: 0 } );

	const stop = inViewFunc( element, () => {
		return () => {
			animateFunc( element, keyframes, options ).then( () => {
				element.style.transition = transition;
			} );
			if ( false === animConfig.replay ) {
				stop();
			}
		};
	}, viewOptions );
}

function scrollInAnimation( element, transition, animConfig, keyframes, options, animateFunc, inViewFunc ) {
	const viewOptions = { amount: 0, root: null };
	const stop = inViewFunc( element, () => {
		animateFunc( element, keyframes, options ).then( () => {
			element.style.transition = transition;
		} );
		if ( false === animConfig.replay ) {
			stop();
		}
	}, viewOptions );
}

function defaultAnimation( element, transition, keyframes, options, animateFunc ) {
	animateFunc( element, keyframes, options ).then( () => {
		element.style.transition = transition;
	} );
}

function applyAnimation( element, animConfig, animateFunc, inViewFunc ) {
	const keyframes = getKeyframes( animConfig.effect, animConfig.type, animConfig.direction );

	const options = {
		duration: animConfig.duration / 1000,
		delay: animConfig.delay / 1000,
		ease: config.defaultEasing,
	};

	// WHY - Transition can be set on elements but once it sets it destroys all animations, so we basically put it aside.
	const transition = element.style.transition;
	element.style.transition = 'none';
	if ( 'scrollOut' === animConfig.trigger ) {
		scrollOutAnimation( element, transition, animConfig, keyframes, options, animateFunc, inViewFunc );
	} else if ( 'scrollIn' === animConfig.trigger ) {
		scrollInAnimation( element, transition, animConfig, keyframes, options, animateFunc, inViewFunc );
	} else {
		defaultAnimation( element, transition, keyframes, options, animateFunc );
	}
}

function skipInteraction( interaction ) {
	const activeBreakpoint = getActiveBreakpoint();
	return interaction.breakpoints?.excluded?.includes( activeBreakpoint );
}

function processElementInteractions( element, interactions, animateFunc, inViewFunc ) {
	if ( ! interactions || ! Array.isArray( interactions ) ) {
		return;
	}

	interactions.forEach( ( interaction ) => {
		if ( skipInteraction( interaction ) ) {
			return;
		}

		const animConfig = extractAnimationConfig( interaction );

		if ( animConfig ) {
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

				const element = document.querySelector( `[data-interaction-id="${ elementId }"]` );

				if ( ! element ) {
					return;
				}

				processElementInteractions( element, interactions, animateFunc, inViewFunc );
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
