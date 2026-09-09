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
} );
