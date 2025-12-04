import { config, getKeyframes, parseAnimationName } from './interactions-utils.js';

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
	if ( 'undefined' === typeof animate && ! window.Motion?.animate ) {
		setTimeout( initInteractions, 100 );
		return;
	}

	const animateFunc = 'undefined' !== typeof animate ? animate : window.Motion?.animate;
	const inViewFunc = 'undefined' !== typeof inView ? inView : window.Motion?.inView;

	if ( ! inViewFunc || ! animateFunc ) {
		return;
	}

	const elements = document.querySelectorAll( '[data-interactions]' );

	elements.forEach( ( element ) => {
		const interactionsData = element.getAttribute( 'data-interactions' );
		let interactions = [];

		try {
			interactions = JSON.parse( interactionsData );
		} catch ( error ) {
			return;
		}

		interactions.forEach( ( interaction ) => {
			const animationName = 'string' === typeof interaction
				? interaction
				: interaction?.animation?.animation_id;

			const animConfig = animationName && parseAnimationName( animationName );

			if ( animConfig ) {
				applyAnimation( element, animConfig, animateFunc, inViewFunc );
			}
		} );
	} );
}

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', initInteractions );
} else {
	initInteractions();
}
