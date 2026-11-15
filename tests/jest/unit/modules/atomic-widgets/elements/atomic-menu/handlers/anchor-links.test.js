import AnchorLinks from 'elementor/modules/atomic-widgets/elements/atomic-menu/handlers/anchor-links';

const VIEWPORT_HEIGHT = 800;

class IntersectionObserverMock {
	static instances = [];

	constructor( callback, options ) {
		this.callback = callback;
		this.options = options;
		this.targets = [];
		this.disconnected = false;
		IntersectionObserverMock.instances.push( this );
	}

	observe( target ) {
		this.targets.push( target );
	}

	disconnect() {
		this.disconnected = true;
	}

	trigger( isIntersecting ) {
		this.callback( this.targets.map( ( target ) => ( { target, isIntersecting } ) ) );
	}
}

function createEntry( id, height = 100 ) {
	const item = document.createElement( 'a' );
	const target = document.createElement( 'section' );
	target.id = id;
	Object.defineProperty( target, 'offsetHeight', { value: height, configurable: true } );

	return { item, target };
}

function initialize( entries, onChange = jest.fn() ) {
	const anchorLinks = new AnchorLinks( entries, onChange );
	anchorLinks.initialize();
	created.push( anchorLinks );

	return anchorLinks;
}

const created = [];

describe( 'AnchorLinks', () => {
	const originalObserver = global.IntersectionObserver;
	const originalHeight = window.innerHeight;

	beforeEach( () => {
		IntersectionObserverMock.instances = [];
		global.IntersectionObserver = IntersectionObserverMock;
		window.innerHeight = VIEWPORT_HEIGHT;
	} );

	afterEach( () => {
		created.splice( 0 ).forEach( ( anchorLinks ) => anchorLinks.destroy() );
		global.IntersectionObserver = originalObserver;
		window.innerHeight = originalHeight;
	} );

	it( 'should observe every target with the viewport midpoint rule', () => {
		// Arrange
		const short = createEntry( 'short', 100 );
		const tall = createEntry( 'tall', ( VIEWPORT_HEIGHT / 2 ) + 1 );

		// Act
		initialize( [ short, tall ] );

		// Assert
		const [ shortObserver, tallObserver ] = IntersectionObserverMock.instances;

		expect( shortObserver.targets ).toEqual( [ short.target ] );
		expect( shortObserver.options.rootMargin ).toBe( '0px 0px -400px 0px' );
		expect( tallObserver.targets ).toEqual( [ tall.target ] );
		expect( tallObserver.options.rootMargin ).toBe( '-400px 0px -400px 0px' );
	} );

	it( 'should report the item while its section is in view and clear it when it leaves', () => {
		// Arrange
		const entry = createEntry( 'contact' );
		const onChange = jest.fn();
		initialize( [ entry ], onChange );
		const [ observer ] = IntersectionObserverMock.instances;

		// Act
		observer.trigger( true );
		observer.trigger( false );

		// Assert
		expect( onChange ).toHaveBeenNthCalledWith( 1, new Set( [ entry.item ] ) );
		expect( onChange ).toHaveBeenNthCalledWith( 2, new Set() );
	} );

	it( 'should keep several overlapping sections active at once', () => {
		// Arrange
		const first = createEntry( 'first' );
		const second = createEntry( 'second' );
		const onChange = jest.fn();
		initialize( [ first, second ], onChange );
		const [ firstObserver, secondObserver ] = IntersectionObserverMock.instances;

		// Act
		firstObserver.trigger( true );
		secondObserver.trigger( true );

		// Assert
		expect( onChange ).toHaveBeenLastCalledWith( new Set( [ first.item, second.item ] ) );
	} );

	it( 'should observe nothing when there are no entries', () => {
		// Act
		initialize( [] );

		// Assert
		expect( IntersectionObserverMock.instances ).toHaveLength( 0 );
	} );

	it( 'should keep the active items while the viewport is resized', () => {
		// Arrange
		const entry = createEntry( 'contact' );
		const onChange = jest.fn();
		initialize( [ entry ], onChange );
		IntersectionObserverMock.instances[ 0 ].trigger( true );
		onChange.mockClear();

		// Act
		window.dispatchEvent( new Event( 'resize' ) );
		IntersectionObserverMock.instances[ 1 ].trigger( true );

		// Assert
		expect( onChange ).toHaveBeenCalledTimes( 1 );
		expect( onChange ).toHaveBeenCalledWith( new Set( [ entry.item ] ) );
	} );

	it( 'should recalculate the margins when the viewport is resized', () => {
		// Arrange
		const entry = createEntry( 'contact' );
		initialize( [ entry ] );
		const [ firstObserver ] = IntersectionObserverMock.instances;

		// Act
		window.innerHeight = 400;
		window.dispatchEvent( new Event( 'resize' ) );

		// Assert
		const secondObserver = IntersectionObserverMock.instances[ 1 ];

		expect( firstObserver.disconnected ).toBe( true );
		expect( secondObserver.options.rootMargin ).toBe( '0px 0px -200px 0px' );
	} );

	it( 'should stop observing and listening after destroy', () => {
		// Arrange
		const entry = createEntry( 'contact' );
		const anchorLinks = initialize( [ entry ] );

		// Act
		anchorLinks.destroy();
		window.dispatchEvent( new Event( 'resize' ) );

		// Assert
		expect( IntersectionObserverMock.instances ).toHaveLength( 1 );
		expect( IntersectionObserverMock.instances[ 0 ].disconnected ).toBe( true );
	} );

	it( 'should use the latest entry when the observer reports several at once', () => {
		// Arrange
		const entry = createEntry( 'contact' );
		const onChange = jest.fn();
		initialize( [ entry ], onChange );
		const [ observer ] = IntersectionObserverMock.instances;

		// Act
		observer.callback( [
			{ target: entry.target, isIntersecting: true },
			{ target: entry.target, isIntersecting: false },
		] );

		// Assert
		expect( onChange ).toHaveBeenLastCalledWith( new Set() );
	} );

	it.each( [
		[ 'a section exactly half the viewport', VIEWPORT_HEIGHT / 2, '0px 0px -400px 0px' ],
		[ 'a section just over half the viewport', ( VIEWPORT_HEIGHT / 2 ) + 1, '-400px 0px -400px 0px' ],
		[ 'a collapsed section', 0, '0px 0px -400px 0px' ],
	] )( 'should compute the root margin for %s', ( _, height, expected ) => {
		// Arrange
		const entry = createEntry( 'section', height );

		// Act
		initialize( [ entry ] );

		// Assert
		expect( IntersectionObserverMock.instances[ 0 ].options.rootMargin ).toBe( expected );
	} );

	describe( 'at the bottom of the page', () => {
		const PAGE_HEIGHT = 2000;
		let scrollY;
		let rects;

		function stubGeometry( entries ) {
			Object.defineProperty( window, 'scrollY', { get: () => scrollY, configurable: true } );
			Object.defineProperty( document.documentElement, 'scrollHeight', { get: () => PAGE_HEIGHT, configurable: true } );

			entries.forEach( ( { target } ) => {
				target.getBoundingClientRect = () => rects.get( target );
			} );
		}

		function buildPage() {
			const first = createEntry( 'first', 900 );
			const last = createEntry( 'last', 200 );
			document.body.append( first.target, last.target );
			rects = new Map( [
				[ first.target, { top: -700, bottom: 200 } ],
				[ last.target, { top: 600, bottom: 800 } ],
			] );
			scrollY = PAGE_HEIGHT - VIEWPORT_HEIGHT;
			stubGeometry( [ first, last ] );

			return { first, last };
		}

		afterEach( () => {
			document.body.innerHTML = '';
		} );

		it( 'should make a short last section current although it never reaches the midpoint region', () => {
			// Arrange
			const { first, last } = buildPage();
			const onChange = jest.fn();
			initialize( [ first, last ], onChange );
			const [ firstObserver ] = IntersectionObserverMock.instances;

			// Act
			firstObserver.trigger( true );

			// Assert
			expect( onChange ).toHaveBeenLastCalledWith( new Set( [ last.item ] ) );
		} );

		it( 'should keep the midpoint rule when the page is not scrolled to the bottom', () => {
			// Arrange
			const { first, last } = buildPage();
			scrollY = 0;
			const onChange = jest.fn();
			initialize( [ first, last ], onChange );

			// Act
			IntersectionObserverMock.instances[ 0 ].trigger( true );

			// Assert
			expect( onChange ).toHaveBeenLastCalledWith( new Set( [ first.item ] ) );
		} );

		it( 'should update when scrolling reaches the bottom without any observer firing', () => {
			// Arrange
			const { first, last } = buildPage();
			scrollY = 0;
			const onChange = jest.fn();
			initialize( [ first, last ], onChange );
			IntersectionObserverMock.instances[ 0 ].trigger( true );

			// Act
			scrollY = PAGE_HEIGHT - VIEWPORT_HEIGHT;
			window.dispatchEvent( new Event( 'scroll' ) );

			// Assert
			expect( onChange ).toHaveBeenLastCalledWith( new Set( [ last.item ] ) );
		} );

		it( 'should not report again while the active items are unchanged', () => {
			// Arrange
			const { first, last } = buildPage();
			const onChange = jest.fn();
			initialize( [ first, last ], onChange );
			IntersectionObserverMock.instances[ 0 ].trigger( true );
			onChange.mockClear();

			// Act
			window.dispatchEvent( new Event( 'scroll' ) );
			window.dispatchEvent( new Event( 'scroll' ) );

			// Assert
			expect( onChange ).not.toHaveBeenCalled();
		} );

		it( 'should not force the last section when it is outside the viewport', () => {
			// Arrange
			const { first, last } = buildPage();
			rects.set( last.target, { top: 900, bottom: 1100 } );
			const onChange = jest.fn();
			initialize( [ first, last ], onChange );

			// Act
			IntersectionObserverMock.instances[ 0 ].trigger( true );

			// Assert
			expect( onChange ).toHaveBeenLastCalledWith( new Set( [ first.item ] ) );
		} );
	} );
} );
