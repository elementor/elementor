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

function initBreakpoints() {
	window.elementorFrontendConfig = {
		responsive: {
			activeBreakpoints: {
				mobile: { value: 768, direction: 'max' },
				mobile_extra: { value: 880, direction: 'max' },
				tablet: { value: 1024, direction: 'max' },
				tablet_extra: { value: 1200, direction: 'max' },
				laptop: { value: 1366, direction: 'max' },
				widescreen: { value: 2440, direction: 'min' },
			},
		},
	};
}

function installMotionMocks( { animate, inView, scroll } ) {
	window.Motion = {
		animate,
		inView,
		scroll,
	};
}

describe( 'Interactions', () => {
	beforeAll( () => {
		initBreakpoints();
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
} );
