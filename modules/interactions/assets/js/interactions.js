const config = window.ElementorInteractionsConfig?.constants;

function getKeyframes( effect, type, direction ) {
	const isIn = 'in' === type;
	const keyframes = {};

	keyframes.opacity = isIn ? [ 0, 1 ] : [ 1, 0 ];

	if ( 'scale' === effect ) {
		keyframes.scale = isIn ? [ config.scaleStart, 1 ] : [ 1, config.scaleStart ];
	}

	if ( direction ) {
		const distance = config.slideDistance;
		const movement = {
			left: { x: isIn ? [ -distance, 0 ] : [ 0, -distance ] },
			right: { x: isIn ? [ distance, 0 ] : [ 0, distance ] },
			top: { y: isIn ? [ -distance, 0 ] : [ 0, -distance ] },
			bottom: { y: isIn ? [ distance, 0 ] : [ 0, distance ] },
		};

		Object.assign( keyframes, movement[ direction ] );
	}

	return keyframes;
}

function parseAnimationName( name ) {
	const [ trigger, effect, type, direction ] = name.split( '-' );
	return { trigger, effect, type, direction: direction || null };
}

function applyAnimation( element, animConfig, animateFunc, inViewFunc ) {
	const keyframes = getKeyframes( animConfig.effect, animConfig.type, animConfig.direction );
	const options = {
		duration: config.defaultDuration,
		delay: config.defaultDelay,
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
