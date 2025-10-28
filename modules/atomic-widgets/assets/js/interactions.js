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

		interactions.forEach( () => {
			try {
				inViewFunc( element, () => {
					animateFunc( element, {
						opacity: [ 0, 1 ],
						x: [ -100, 0 ],
					}, {
						duration: 1,
						easing: 'ease-in-out',
					} );

					return () => {};
				}, {
					root: null,
					amount: 0.1,
				} );
			} catch ( error ) {}
		} );
	} );
}

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', initInteractions );
} else {
	initInteractions();
}