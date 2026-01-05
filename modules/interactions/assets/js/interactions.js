import {
	config,
	getKeyframes,
	parseAnimationName,
	extractAnimationId,
	getAnimateFunction,
	getInViewFunction,
	waitForAnimateFunction,
	parseInteractionsData,
} from './interactions-utils.js';

function scrollOutAnimation( element, transition, animConfig, keyframes, options, animateFunc, inViewFunc ) {
	const viewOptions = { amount: 0.85, root: null };
	const resetKeyframes = getKeyframes( animConfig.effect, 'in', animConfig.direction, element );

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
	const keyframes = getKeyframes( animConfig.effect, animConfig.type, animConfig.direction, element );
	const options = {
		duration: animConfig.duration / 1000,
		delay: animConfig.delay / 1000,
		easing: config.easing,
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

function initInteractions() {
	waitForAnimateFunction( () => {
		const animateFunc = getAnimateFunction();
		const inViewFunc = getInViewFunction();

		if ( ! inViewFunc || ! animateFunc ) {
			return;
		}

		const elements = document.querySelectorAll( '[data-interactions]' );

		elements.forEach( ( element ) => {
			const interactionsData = element.getAttribute( 'data-interactions' );
			const parsedData = parseInteractionsData( interactionsData );

			if ( ! parsedData || ! Array.isArray( parsedData ) ) {
				return;
			}

			parsedData.forEach( ( interaction ) => {
				const animationName = extractAnimationId( interaction );
				const animConfig = animationName && parseAnimationName( animationName );

				if ( animConfig ) {
					applyAnimation( element, animConfig, animateFunc, inViewFunc );
				}
			} );
		} );
	} );
}

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', initInteractions );
} else {
	initInteractions();
}
