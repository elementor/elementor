import { stubInteractionsConfig } from './utils';

function flushPromises() {
	return Promise.resolve();
}

function setReadyStateComplete() {
	// JSDOM sometimes sets readyState to "complete" already, but make it deterministic for this module,
	// because `interactions-pro.js` runs `initInteractions()` at import-time based on `document.readyState`.
	Object.defineProperty( document, 'readyState', {
		value: 'complete',
		configurable: true,
	} );
}

function installMotionMocks( { animate, inView, scroll } ) {
	window.Motion = {
		animate,
		inView,
		scroll,
	};
}

function applyLastKeyframeStyles( element, keyframes ) {
	if ( keyframes.opacity ) {
		element.style.opacity = String( keyframes.opacity[ keyframes.opacity.length - 1 ] );
	}

	if ( keyframes.scale || keyframes.x || keyframes.y || keyframes.scaleX || keyframes.scaleY ) {
		element.style.transform = 'matrix(1, 0, 0, 1, 0, 0)';
	}
}

function createStyleWritingAnimate() {
	return jest.fn( ( element, keyframes ) => {
		applyLastKeyframeStyles( element, keyframes );
		return Promise.resolve();
	} );
}

function runRafSync() {
	jest.spyOn( window, 'requestAnimationFrame' ).mockImplementation( ( callback ) => {
		callback( 0 );
		return 0;
	} );
}

function createInteraction( trigger, effect, type, { direction = '', replay = false } = {} ) {
	return {
		trigger,
		breakpoints: { excluded: [] },
		animation: {
			effect,
			type,
			direction,
			timing_config: { duration: 600, delay: 0 },
			config: { replay, easing: 'easeIn' },
		},
	};
}

function mountInteractions( element, interactions ) {
	document.body.appendChild( element );

	const script = document.createElement( 'script' );
	script.id = 'elementor-interactions-data';
	script.type = 'application/json';
	script.textContent = JSON.stringify( [
		{ elementId: element.getAttribute( 'data-interaction-id' ), interactions },
	] );
	document.body.appendChild( script );

	jest.isolateModules( () => {
		require( 'elementor/modules/interactions/assets/js/interactions.js' );
	} );
}

function createInteractionElement( id ) {
	const element = document.createElement( 'div' );
	element.setAttribute( 'data-interaction-id', id );

	return element;
}

describe( 'Interactions', () => {
	beforeAll( () => {
		stubInteractionsConfig();
	} );

	beforeEach( () => {
		jest.resetModules();

		document.body.innerHTML = '';
		setReadyStateComplete();
	} );

	it( 'skips interaction when active breakpoint is in breakpoints.excluded', async () => {
		const animate = jest.fn( () => Promise.resolve() );
		const inView = jest.fn();
		const scroll = jest.fn();
		installMotionMocks( { animate, inView, scroll } );

		Object.defineProperty( window, 'innerWidth', {
			value: 1600,
			writable: true,
			configurable: true,
		} );

		const element = document.createElement( 'div' );
		element.setAttribute( 'data-interaction-id', 'excluded-desktop' );
		document.body.appendChild( element );

		const script = document.createElement( 'script' );
		script.id = 'elementor-interactions-data';
		script.type = 'application/json';
		script.textContent = JSON.stringify( [
			{
				elementId: 'excluded-desktop',
				interactions: [
					{
						trigger: 'load',
						breakpoints: { excluded: [ 'desktop' ] },
						animation: {
							effect: 'fade',
							type: 'in',
							direction: '',
							timing_config: { duration: 600, delay: 0 },
							config: { replay: false, easing: 'easeIn' },
						},
					},
				],
			},
		] );
		document.body.appendChild( script );

		jest.isolateModules( () => {
			require( 'elementor/modules/interactions/assets/js/interactions.js' );
		} );

		await flushPromises();

		expect( animate ).not.toHaveBeenCalled();
	} );

	it( 'runs interaction when active breakpoint is not in breakpoints.excluded', async () => {
		const animate = jest.fn( () => Promise.resolve() );
		const inView = jest.fn();
		const scroll = jest.fn();
		installMotionMocks( { animate, inView, scroll } );

		Object.defineProperty( window, 'innerWidth', {
			value: 900,
			writable: true,
			configurable: true,
		} );

		const element = document.createElement( 'div' );
		element.setAttribute( 'data-interaction-id', 'not-excluded' );
		document.body.appendChild( element );

		const script = document.createElement( 'script' );
		script.id = 'elementor-interactions-data';
		script.type = 'application/json';
		script.textContent = JSON.stringify( [
			{
				elementId: 'not-excluded',
				interactions: [
					{
						trigger: 'load',
						breakpoints: { excluded: [ 'mobile' ] },
						animation: {
							effect: 'fade',
							type: 'in',
							direction: '',
							timing_config: { duration: 600, delay: 0 },
							config: { replay: false, easing: 'easeIn' },
						},
					},
				],
			},
		] );
		document.body.appendChild( script );

		jest.isolateModules( () => {
			require( 'elementor/modules/interactions/assets/js/interactions.js' );
		} );

		await flushPromises();

		expect( animate ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'preserves existing translate transform when interaction animates scale', async () => {
		const animate = jest.fn( () => Promise.resolve() );
		const inView = jest.fn();
		const scroll = jest.fn();
		installMotionMocks( { animate, inView, scroll } );

		const getComputedStyleSpy = jest.spyOn( window, 'getComputedStyle' ).mockReturnValue( {
			transform: 'matrix(1, 0, 0, 1, 15, 25)',
		} );

		const element = document.createElement( 'div' );
		element.setAttribute( 'data-interaction-id', 'preserve-transform' );
		document.body.appendChild( element );

		const script = document.createElement( 'script' );
		script.id = 'elementor-interactions-data';
		script.type = 'application/json';
		script.textContent = JSON.stringify( [
			{
				elementId: 'preserve-transform',
				interactions: [
					{
						trigger: 'load',
						breakpoints: { excluded: [] },
						animation: {
							effect: 'scale',
							type: 'in',
							direction: '',
							timing_config: { duration: 600, delay: 0 },
							config: { replay: false, easing: 'easeIn' },
						},
					},
				],
			},
		] );
		document.body.appendChild( script );

		jest.isolateModules( () => {
			require( 'elementor/modules/interactions/assets/js/interactions.js' );
		} );

		await flushPromises();

		expect( animate ).toHaveBeenCalledWith(
			element,
			expect.objectContaining( {
				scale: [ 0, 1 ],
				x: [ 15, 15 ],
				y: [ 25, 25 ],
			} ),
			expect.objectContaining( {
				duration: 0.6,
				delay: 0,
				ease: 'easeIn',
			} ),
		);

		getComputedStyleSpy.mockRestore();
	} );

	it( 'does not throw and stops observing when a scrollOut interaction leaves the viewport with replay disabled', async () => {
		const animate = jest.fn( () => Promise.resolve() );
		const stopObserving = jest.fn();
		const inView = jest.fn( ( element, callback ) => {
			const onLeaveViewport = callback();
			onLeaveViewport();
			return stopObserving;
		} );
		const scroll = jest.fn();
		installMotionMocks( { animate, inView, scroll } );

		const element = document.createElement( 'div' );
		element.setAttribute( 'data-interaction-id', 'scroll-out-element' );
		document.body.appendChild( element );

		const script = document.createElement( 'script' );
		script.id = 'elementor-interactions-data';
		script.type = 'application/json';
		script.textContent = JSON.stringify( [
			{
				elementId: 'scroll-out-element',
				interactions: [
					{
						trigger: 'scrollOut',
						breakpoints: { excluded: [] },
						animation: {
							effect: 'fade',
							type: 'in',
							direction: '',
							timing_config: { duration: 600, delay: 0 },
							config: { replay: false, easing: 'easeIn' },
						},
					},
				],
			},
		] );
		document.body.appendChild( script );

		expect( () => {
			jest.isolateModules( () => {
				require( 'elementor/modules/interactions/assets/js/interactions.js' );
			} );
		} ).not.toThrow();

		await flushPromises();

		expect( animate ).toHaveBeenCalledTimes( 2 );
		expect( stopObserving ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'clears leftover inline transform after a load scale-in animation completes', async () => {
		runRafSync();
		const animate = createStyleWritingAnimate();
		installMotionMocks( { animate, inView: jest.fn(), scroll: jest.fn() } );

		const element = document.createElement( 'div' );
		element.setAttribute( 'data-interaction-id', 'scale-in-hover' );
		document.body.appendChild( element );

		const script = document.createElement( 'script' );
		script.id = 'elementor-interactions-data';
		script.type = 'application/json';
		script.textContent = JSON.stringify( [
			{
				elementId: 'scale-in-hover',
				interactions: [
					{
						trigger: 'load',
						breakpoints: { excluded: [] },
						animation: {
							effect: 'scale',
							type: 'in',
							direction: '',
							timing_config: { duration: 600, delay: 0 },
							config: { replay: false, easing: 'easeIn' },
						},
					},
				],
			},
		] );
		document.body.appendChild( script );

		jest.isolateModules( () => {
			require( 'elementor/modules/interactions/assets/js/interactions.js' );
		} );

		await flushPromises();

		expect( element.style.transform ).toBe( '' );
		expect( element.style.opacity ).toBe( '' );
	} );

	it( 'clears leftover inline opacity after a load fade-in animation completes', async () => {
		runRafSync();
		const animate = createStyleWritingAnimate();
		installMotionMocks( { animate, inView: jest.fn(), scroll: jest.fn() } );

		const element = document.createElement( 'div' );
		element.setAttribute( 'data-interaction-id', 'fade-in-hover' );
		document.body.appendChild( element );

		const script = document.createElement( 'script' );
		script.id = 'elementor-interactions-data';
		script.type = 'application/json';
		script.textContent = JSON.stringify( [
			{
				elementId: 'fade-in-hover',
				interactions: [
					{
						trigger: 'load',
						breakpoints: { excluded: [] },
						animation: {
							effect: 'fade',
							type: 'in',
							direction: '',
							timing_config: { duration: 600, delay: 0 },
							config: { replay: false, easing: 'easeIn' },
						},
					},
				],
			},
		] );
		document.body.appendChild( script );

		jest.isolateModules( () => {
			require( 'elementor/modules/interactions/assets/js/interactions.js' );
		} );

		await flushPromises();

		expect( element.style.opacity ).toBe( '' );
		expect( element.style.transform ).toBe( '' );
	} );

	it( 'does not clear inline styles after a load slide-out animation completes', async () => {
		runRafSync();
		const animate = createStyleWritingAnimate();
		installMotionMocks( { animate, inView: jest.fn(), scroll: jest.fn() } );

		const element = document.createElement( 'div' );
		element.setAttribute( 'data-interaction-id', 'slide-out-hold' );
		document.body.appendChild( element );

		const script = document.createElement( 'script' );
		script.id = 'elementor-interactions-data';
		script.type = 'application/json';
		script.textContent = JSON.stringify( [
			{
				elementId: 'slide-out-hold',
				interactions: [
					{
						trigger: 'load',
						breakpoints: { excluded: [] },
						animation: {
							effect: 'slide',
							type: 'out',
							direction: 'left',
							timing_config: { duration: 600, delay: 0 },
							config: { replay: false, easing: 'easeIn' },
						},
					},
				],
			},
		] );
		document.body.appendChild( script );

		jest.isolateModules( () => {
			require( 'elementor/modules/interactions/assets/js/interactions.js' );
		} );

		await flushPromises();

		expect( element.style.transform ).toBe( 'matrix(1, 0, 0, 1, 0, 0)' );
	} );

	it( 'clears leftover inline styles after a scrollIn animation completes', async () => {
		runRafSync();
		const animate = createStyleWritingAnimate();

		const element = document.createElement( 'div' );
		element.setAttribute( 'data-interaction-id', 'scroll-in-hover' );
		element.style.transition = 'opacity 0.3s';
		document.body.appendChild( element );

		const inView = jest.fn( ( el, callback ) => {
			// Defer so the handler's `stop` closure is initialized before it runs,
			// matching scrollIn's real async in-view behavior.
			Promise.resolve().then( () => callback() );
			return jest.fn();
		} );
		installMotionMocks( { animate, inView, scroll: jest.fn() } );

		const script = document.createElement( 'script' );
		script.id = 'elementor-interactions-data';
		script.type = 'application/json';
		script.textContent = JSON.stringify( [
			{
				elementId: 'scroll-in-hover',
				interactions: [
					{
						trigger: 'scrollIn',
						breakpoints: { excluded: [] },
						animation: {
							effect: 'fade',
							type: 'in',
							direction: '',
							timing_config: { duration: 600, delay: 0 },
							config: { replay: false, easing: 'easeIn' },
						},
					},
				],
			},
		] );
		document.body.appendChild( script );

		jest.isolateModules( () => {
			require( 'elementor/modules/interactions/assets/js/interactions.js' );
		} );

		// Deferred inView callback, then animation.then() + rAF reset.
		await flushPromises();
		await flushPromises();

		expect( element.style.opacity ).toBe( '' );
		expect( element.style.transform ).toBe( '' );
		// The authored inline transition must survive the cleanup.
		expect( element.style.transition ).toBe( 'opacity 0.3s' );
	} );

	it( 'restores the pre-existing inline opacity instead of clearing it after a fade-in completes', async () => {
		runRafSync();
		installMotionMocks( { animate: createStyleWritingAnimate(), inView: jest.fn(), scroll: jest.fn() } );

		const element = createInteractionElement( 'inline-opacity' );
		element.style.opacity = '0.6';
		mountInteractions( element, [ createInteraction( 'load', 'fade', 'in' ) ] );

		await flushPromises();

		expect( element.style.opacity ).toBe( '0.6' );
	} );

	it( 'restores the pre-existing inline transform instead of clearing it after a scale-in completes', async () => {
		runRafSync();
		installMotionMocks( { animate: createStyleWritingAnimate(), inView: jest.fn(), scroll: jest.fn() } );

		const element = createInteractionElement( 'inline-transform' );
		element.style.transform = 'rotate(5deg)';
		mountInteractions( element, [ createInteraction( 'load', 'scale', 'in' ) ] );

		await flushPromises();

		expect( element.style.transform ).toBe( 'rotate(5deg)' );
	} );

	it( 'does not clear inline styles while another interaction on the same element is still running', async () => {
		runRafSync();
		const resolvers = [];
		const animate = jest.fn( ( element, keyframes ) => {
			applyLastKeyframeStyles( element, keyframes );
			return new Promise( ( resolve ) => resolvers.push( resolve ) );
		} );
		installMotionMocks( { animate, inView: jest.fn(), scroll: jest.fn() } );

		const element = createInteractionElement( 'multiple-interactions' );
		mountInteractions( element, [
			createInteraction( 'load', 'fade', 'in' ),
			createInteraction( 'load', '', 'in', { direction: 'left' } ),
		] );

		await flushPromises();
		expect( animate ).toHaveBeenCalledTimes( 2 );

		resolvers[ 0 ]();
		await flushPromises();

		expect( element.style.opacity ).toBe( '1' );
		expect( element.style.transform ).toBe( 'matrix(1, 0, 0, 1, 0, 0)' );

		resolvers[ 1 ]();
		await flushPromises();

		expect( element.style.opacity ).toBe( '' );
		expect( element.style.transform ).toBe( '' );
	} );

	it( 'fades in to the stylesheet opacity and leaves no inline opacity behind', async () => {
		runRafSync();
		const animate = createStyleWritingAnimate();
		installMotionMocks( { animate, inView: jest.fn(), scroll: jest.fn() } );

		const style = document.createElement( 'style' );
		style.textContent = '[data-interaction-id="authored-opacity"] { opacity: 0.6; }';
		document.head.appendChild( style );

		const element = createInteractionElement( 'authored-opacity' );
		mountInteractions( element, [ createInteraction( 'load', 'fade', 'in' ) ] );

		await flushPromises();

		expect( animate.mock.calls[ 0 ][ 1 ].opacity ).toEqual( [ 0, 0.6 ] );
		expect( element.style.opacity ).toBe( '' );

		style.remove();
	} );

	it( 'restores the opacity when a fade finishes before a slide that does not write opacity', async () => {
		runRafSync();
		const resolvers = [];
		const animate = jest.fn( ( element, keyframes ) => {
			applyLastKeyframeStyles( element, keyframes );
			return new Promise( ( resolve ) => resolvers.push( resolve ) );
		} );
		installMotionMocks( { animate, inView: jest.fn(), scroll: jest.fn() } );

		const element = createInteractionElement( 'fade-before-slide' );
		mountInteractions( element, [
			createInteraction( 'load', 'fade', 'in' ),
			createInteraction( 'load', 'slide', 'in', { direction: 'left' } ),
		] );

		await flushPromises();
		expect( animate.mock.calls[ 1 ][ 1 ].opacity ).toBeUndefined();

		resolvers[ 0 ]();
		await flushPromises();

		expect( element.style.opacity ).toBe( '' );
		expect( element.style.transform ).toBe( 'matrix(1, 0, 0, 1, 0, 0)' );

		resolvers[ 1 ]();
		await flushPromises();

		expect( element.style.transform ).toBe( '' );
	} );

	it( 'restores the styles after an animation that Motion.js stopped and never settled', async () => {
		runRafSync();
		const animate = jest.fn( ( element, keyframes ) => {
			applyLastKeyframeStyles( element, keyframes );
			return 1 === animate.mock.calls.length ? new Promise( () => {} ) : Promise.resolve();
		} );
		installMotionMocks( { animate, inView: jest.fn(), scroll: jest.fn() } );

		const element = createInteractionElement( 'stopped-animation' );
		mountInteractions( element, [
			createInteraction( 'load', 'fade', 'in' ),
			createInteraction( 'load', 'fade', 'in' ),
		] );

		await flushPromises();

		expect( element.style.opacity ).toBe( '' );
	} );

	it( 'keeps the opacity a finished "out" animation committed when an "in" animation on another style finishes later', async () => {
		runRafSync();
		const resolvers = [];
		const animate = jest.fn( ( element, keyframes ) => {
			applyLastKeyframeStyles( element, keyframes );
			return new Promise( ( resolve ) => resolvers.push( resolve ) );
		} );
		installMotionMocks( { animate, inView: jest.fn(), scroll: jest.fn() } );

		const element = createInteractionElement( 'committed-out-state' );
		mountInteractions( element, [
			createInteraction( 'load', 'scale', 'in' ),
			createInteraction( 'load', 'fade', 'out' ),
		] );

		await flushPromises();

		resolvers[ 1 ]();
		await flushPromises();
		resolvers[ 0 ]();
		await flushPromises();

		expect( element.style.opacity ).toBe( '0' );
		expect( element.style.transform ).toBe( '' );
	} );

	it( 'keeps the inline opacity a fade-in leaves behind when the stylesheet hides the element', async () => {
		runRafSync();
		const animate = createStyleWritingAnimate();
		installMotionMocks( { animate, inView: jest.fn(), scroll: jest.fn() } );

		const style = document.createElement( 'style' );
		style.textContent = '[data-interaction-id="hidden-opacity"] { opacity: 0; }';
		document.head.appendChild( style );

		const element = createInteractionElement( 'hidden-opacity' );
		mountInteractions( element, [ createInteraction( 'load', 'fade', 'in' ) ] );

		await flushPromises();

		// The fade still runs to fully visible, and the inline `opacity: 1` is kept,
		// because the stylesheet renders `opacity: 0` and would hide the element again.
		expect( animate.mock.calls[ 0 ][ 1 ].opacity ).toEqual( [ 0, 1 ] );
		expect( element.style.opacity ).toBe( '1' );

		style.remove();
	} );

	it( 'restores the authored transition after two interactions on the same element', async () => {
		runRafSync();
		const animate = createStyleWritingAnimate();
		installMotionMocks( { animate, inView: jest.fn(), scroll: jest.fn() } );

		const element = createInteractionElement( 'authored-transition' );
		element.style.transition = 'opacity 0.3s';
		mountInteractions( element, [
			createInteraction( 'load', 'fade', 'in' ),
			createInteraction( 'load', 'scale', 'in' ),
		] );

		await flushPromises();

		expect( animate ).toHaveBeenCalledTimes( 2 );
		// The second interaction must not capture and restore the 'none' the first one set.
		expect( element.style.transition ).toBe( 'opacity 0.3s' );
	} );

	it( 'keeps the transform a finished slide-out committed when a scale-in settles later', async () => {
		runRafSync();
		const resolvers = [];
		const animate = jest.fn( ( element, keyframes ) => {
			applyLastKeyframeStyles( element, keyframes );
			return new Promise( ( resolve ) => resolvers.push( resolve ) );
		} );
		installMotionMocks( { animate, inView: jest.fn(), scroll: jest.fn() } );

		const element = createInteractionElement( 'committed-transform' );
		mountInteractions( element, [
			createInteraction( 'load', 'slide', 'out', { direction: 'left' } ),
			createInteraction( 'load', 'scale', 'in' ),
		] );

		await flushPromises();

		resolvers[ 0 ]();
		await flushPromises();

		resolvers[ 1 ]();
		await flushPromises();

		// The scale-in ends at the baseline, but it must not clear the transform
		// the slide-out already committed.
		expect( element.style.transform ).toBe( 'matrix(1, 0, 0, 1, 0, 0)' );
	} );

	it( 'clears the inline transform when a later transform animation returns to the baseline', async () => {
		runRafSync();
		const resolvers = [];
		const animate = jest.fn( ( element, keyframes ) => {
			applyLastKeyframeStyles( element, keyframes );
			return new Promise( ( resolve ) => resolvers.push( resolve ) );
		} );
		installMotionMocks( { animate, inView: jest.fn(), scroll: jest.fn() } );

		const element = createInteractionElement( 'returned-to-baseline' );
		mountInteractions( element, [
			createInteraction( 'load', 'slide', 'out', { direction: 'left' } ),
			createInteraction( 'load', 'slide', 'in', { direction: 'left' } ),
		] );

		await flushPromises();

		resolvers[ 0 ]();
		await flushPromises();

		resolvers[ 1 ]();
		await flushPromises();

		// The slide-out committed an off-baseline transform, but the slide-in brings the
		// element back to its stylesheet state, so the inline transform must be cleared
		// instead of masking stylesheet transform rules.
		expect( element.style.transform ).toBe( '' );
	} );

	it( 'restores the original inline styles after every replay of a scrollIn interaction', async () => {
		runRafSync();
		const animate = createStyleWritingAnimate();
		let enterViewport;
		const inView = jest.fn( ( el, callback ) => {
			enterViewport = callback;
			return jest.fn();
		} );
		installMotionMocks( { animate, inView, scroll: jest.fn() } );

		const element = createInteractionElement( 'scroll-in-replay' );
		element.style.opacity = '0.6';
		mountInteractions( element, [ createInteraction( 'scrollIn', 'fade', 'in', { replay: true } ) ] );

		enterViewport();
		await flushPromises();
		expect( element.style.opacity ).toBe( '0.6' );

		enterViewport();
		await flushPromises();

		expect( animate ).toHaveBeenCalledTimes( 2 );
		expect( element.style.opacity ).toBe( '0.6' );
	} );

	it( 'clears leftover inline styles after a scrollOut animation of type "in" completes', async () => {
		runRafSync();
		const inView = jest.fn( ( el, callback ) => {
			callback()();
			return jest.fn();
		} );
		installMotionMocks( { animate: createStyleWritingAnimate(), inView, scroll: jest.fn() } );

		const element = createInteractionElement( 'scroll-out-in' );
		mountInteractions( element, [ createInteraction( 'scrollOut', 'fade', 'in', { replay: true } ) ] );

		await flushPromises();

		expect( element.style.opacity ).toBe( '' );
	} );

	it( 'does not clear inline styles after a scrollOut animation of type "out" completes', async () => {
		runRafSync();
		const inView = jest.fn( ( el, callback ) => {
			callback()();
			return jest.fn();
		} );
		installMotionMocks( { animate: createStyleWritingAnimate(), inView, scroll: jest.fn() } );

		const element = createInteractionElement( 'scroll-out-out' );
		mountInteractions( element, [ createInteraction( 'scrollOut', 'fade', 'out', { replay: true } ) ] );

		await flushPromises();

		expect( element.style.opacity ).toBe( '0' );
	} );

	it( 'clears leftover inline styles when the animation ends at the element stylesheet transform baseline', async () => {
		runRafSync();
		installMotionMocks( { animate: createStyleWritingAnimate(), inView: jest.fn(), scroll: jest.fn() } );

		const getComputedStyleSpy = jest.spyOn( window, 'getComputedStyle' ).mockReturnValue( {
			transform: 'matrix(1, 0, 0, 1, -100, 0)',
		} );

		const element = createInteractionElement( 'baseline-translate' );
		mountInteractions( element, [ createInteraction( 'load', 'fade', 'in' ) ] );

		await flushPromises();

		expect( element.style.transform ).toBe( '' );
		expect( element.style.opacity ).toBe( '' );

		getComputedStyleSpy.mockRestore();
	} );
} );
