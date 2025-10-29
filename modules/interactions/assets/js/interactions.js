const config = window.ElementorInteractionsConfig?.constants || {
	defaultDuration: 0.3,
	defaultDelay: 0,
	slideDistance: 100,
	scaleStart: 0.5,
	easing: 'ease-in-out',
};

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
	const parts = name.split( '-' );

	if ( parts.length < 3 ) {
		return null;
	}

	return {
		effect: parts[ 0 ],
		type: parts[ 1 ],
		direction: 4 === parts.length ? parts[ 2 ] : null,
	};
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

			if ( ! animationName ) {
				return;
			}

			const animConfig = parseAnimationName( animationName );
			if ( ! animConfig ) {
				return;
			}

			const keyframes = getKeyframes( animConfig.effect, animConfig.type, animConfig.direction );
			const options = {
				duration: config.defaultDuration,
				delay: config.defaultDelay,
				easing: config.easing,
			};

			inViewFunc( element, () => {
				animateFunc( element, keyframes, options );
			}, { amount: 0.1 } );
		} );
	} );
}

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', initInteractions );
} else {
	initInteractions();
}
