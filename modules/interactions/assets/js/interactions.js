import {
	config,
	getKeyframes,
	getAnimateFunction,
	getInViewFunction,
	waitForAnimateFunction,
	getInteractionsData,
	findElementByDataId,
	extractAnimationConfig,
	parseAnimationName,
} from './interactions-utils.js';

function scrollOutAnimation( element, transition, animConfig, keyframes, options, animateFunc, inViewFunc ) {
	const viewOptions = { amount: 0.85, root: null };
	const resetKeyframes = getKeyframes( animConfig.effect, 'in', animConfig.direction );

	animateFunc( element, resetKeyframes, { duration: 0 } );

	const stop = inViewFunc( element, () => {
		return () => {
			animateFunc( element, keyframes, options ).then( () => {
				element.style.transition = transition;
			} );
			if ( ! animConfig.replay ) {
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
		if ( ! animConfig.replay ) {
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
		ease: animConfig.easing || config.defaultEasing,
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

/**
 * Initialize interactions from centralized script tag data.
 * Format: [{ elementId, dataId, interactions: [...] }, ...]
 */
function initFromCentralizedData( animateFunc, inViewFunc ) {
	console.log( 'initFromCentralizedData' );
	const elementsData = getInteractionsData();

	console.log( 'elementsData', elementsData );

	if ( ! elementsData || ! Array.isArray( elementsData ) || elementsData.length === 0 ) {
		return false;
	}

	elementsData.forEach( ( elementEntry ) => {
		const { dataId, interactions } = elementEntry;
		console.log( 'dataId', dataId );
		console.log( 'interactions', interactions );

		if ( ! dataId || ! interactions || ! Array.isArray( interactions ) ) {
			return;
		}

		const element = findElementByDataId( dataId );
		console.log( 'element', element );
		if ( ! element ) {
			return;
		}

		interactions.forEach( ( interaction ) => {
			console.log( 'interaction', interaction );
			const animConfig = extractAnimationConfig( interaction );
			console.log( 'animConfig', animConfig );
			if ( animConfig ) {
				applyAnimation( element, animConfig, animateFunc, inViewFunc );
			}
		} );
	} );

	return true;
}

/**
 * Fallback: Initialize interactions from data-interaction-id attributes on elements.
 * Format: data-interaction-id="trigger-effect-type-direction-duration-delay--easing"
 */
function initFromElementAttributes( animateFunc, inViewFunc ) {
	console.log( 'initFromElementAttributes' );
	const elements = document.querySelectorAll( '[data-interaction-id]' );

	if ( ! elements.length ) {
		return false;
	}

	elements.forEach( ( element ) => {
		const interactionId = element.getAttribute( 'data-interaction-id' );
		if ( ! interactionId ) {
			return;
		}

		const animConfig = parseAnimationName( interactionId );
		if ( animConfig ) {
			applyAnimation( element, animConfig, animateFunc, inViewFunc );
		}
	} );

	return true;
}

function initInteractions() {
	console.log( 'initInteractions' );
	waitForAnimateFunction( () => {
		const animateFunc = getAnimateFunction();
		const inViewFunc = getInViewFunction();

		if ( ! inViewFunc || ! animateFunc ) {
			return;
		}

		// Try centralized data first (from script tag)
		const hasCentralizedData = initFromCentralizedData( animateFunc, inViewFunc );

		// Fallback to element attributes if no centralized data
		if ( ! hasCentralizedData ) {
			initFromElementAttributes( animateFunc, inViewFunc );
		}
	} );
}

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', initInteractions );
} else {
	initInteractions();
}
