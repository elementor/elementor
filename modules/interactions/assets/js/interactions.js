import { config, getKeyframes, parseAnimationName } from './interactions-utils.js';

function applyAnimation( element, animConfig, animateFunc, inViewFunc ) {
	const keyframes = getKeyframes( animConfig.effect, animConfig.type, animConfig.direction );
	const options = {
		duration: animConfig.duration / 1000,
		delay: animConfig.delay / 1000,
		easing: config.easing,
	};

	const viewOptions = { amount: 0.1, root: null };

	if ( 'scrollOut' === animConfig.trigger ) {
		inViewFunc( element, ( info ) => {
			if ( ! info.isIntersecting ) {
				animateFunc( element, keyframes, options );
			}
		}, viewOptions );
	} else if ( 'scrollIn' === animConfig.trigger ) {
		inViewFunc( element, () => animateFunc( element, keyframes, options ), viewOptions );
	} else {
		animateFunc( element, keyframes, options );
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
