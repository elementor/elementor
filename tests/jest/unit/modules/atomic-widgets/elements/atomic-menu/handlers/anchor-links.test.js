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
} );
