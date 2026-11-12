jest.mock( '@elementor/frontend-handlers', () => ( {
	register: jest.fn(),
} ), { virtual: true } );

const ORIGIN = 'http://localhost';
const CURRENT_CLASS = 'e--current';

class IntersectionObserverMock {
	static instances = [];

	constructor( callback ) {
		this.callback = callback;
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

async function loadRegistration() {
	jest.resetModules();
	jest.clearAllMocks();

	await import( 'elementor/modules/atomic-widgets/elements/atomic-menu/handlers/atomic-menu-current-handler' );

	const { register } = jest.requireMock( '@elementor/frontend-handlers' );

	return register.mock.calls.map( ( [ call ] ) => call )[ 0 ];
}

function buildMenu( links ) {
	const menu = document.createElement( 'nav' );
	menu.dataset.element_type = 'e-menu';

	const items = links.map( ( href ) => {
		const entry = document.createElement( 'li' );
		entry.dataset.element_type = 'e-menu-entry';

		const item = document.createElement( null === href ? 'span' : 'a' );
		item.dataset.element_type = 'e-menu-item';

		if ( null !== href ) {
			item.setAttribute( 'href', href );
		}

		entry.append( item );
		menu.append( entry );

		return item;
	} );

	document.body.append( menu );

	return { menu, items };
}

function addSection( id ) {
	const section = document.createElement( 'section' );
	section.id = id;
	document.body.append( section );

	return section;
}

describe( 'atomic-menu current handler', () => {
	const originalObserver = global.IntersectionObserver;
	let registration;

	beforeEach( async () => {
		IntersectionObserverMock.instances = [];
		global.IntersectionObserver = IntersectionObserverMock;
		window.history.pushState( {}, '', '/about/' );
		registration = await loadRegistration();
	} );

	afterEach( () => {
		global.IntersectionObserver = originalObserver;
		document.body.innerHTML = '';
	} );

	function run( menu, signal = new AbortController().signal ) {
		registration.callback( { element: menu, signal } );
	}

	it( 'should register for the menu element', () => {
		expect( registration ).toEqual( {
			elementType: 'e-menu',
			id: 'e-menu-current-handler',
			callback: expect.any( Function ),
		} );
	} );

	it( 'should mark only the item that links to the current page', () => {
		// Arrange
		const { menu, items } = buildMenu( [ `${ ORIGIN }/`, `${ ORIGIN }/about`, `${ ORIGIN }/contact/` ] );

		// Act
		run( menu );

		// Assert
		expect( items.map( ( item ) => item.classList.contains( CURRENT_CLASS ) ) ).toEqual( [ false, true, false ] );
		expect( items.map( ( item ) => item.getAttribute( 'aria-current' ) ) ).toEqual( [ null, 'page', null ] );
	} );

	it( 'should mark every item that links to the current page', () => {
		// Arrange
		const { menu, items } = buildMenu( [ `${ ORIGIN }/about/`, `${ ORIGIN }/about`, `${ ORIGIN }/contact/` ] );

		// Act
		run( menu );

		// Assert
		expect( items.map( ( item ) => item.classList.contains( CURRENT_CLASS ) ) ).toEqual( [ true, true, false ] );
	} );

	it( 'should never mark an item without a link', () => {
		// Arrange
		const { menu, items } = buildMenu( [ null, `${ ORIGIN }/about/` ] );

		// Act
		run( menu );

		// Assert
		expect( items[ 0 ].classList.contains( CURRENT_CLASS ) ).toBe( false );
		expect( items[ 0 ].hasAttribute( 'aria-current' ) ).toBe( false );
	} );

	it( 'should never mark a placeholder hash link', () => {
		// Arrange
		const { menu, items } = buildMenu( [ '#', `${ ORIGIN }/about/` ] );

		// Act
		run( menu );

		// Assert
		expect( items[ 0 ].classList.contains( CURRENT_CLASS ) ).toBe( false );
		expect( items[ 0 ].hasAttribute( 'aria-current' ) ).toBe( false );
	} );

	it( 'should never mark a link to an external domain', () => {
		// Arrange
		const { menu, items } = buildMenu( [ 'https://example.com/about/' ] );

		// Act
		run( menu );

		// Assert
		expect( items[ 0 ].classList.contains( CURRENT_CLASS ) ).toBe( false );
	} );

	it( 'should mark items inside a collapsed menu', () => {
		// Arrange
		const { menu, items } = buildMenu( [ `${ ORIGIN }/about/` ] );
		menu.hidden = true;

		// Act
		run( menu );

		// Assert
		expect( items[ 0 ].classList.contains( CURRENT_CLASS ) ).toBe( true );
	} );

	describe( 'one-page anchors', () => {
		beforeEach( () => {
			window.history.pushState( {}, '', '/' );
		} );

		it( 'should mark the anchor item while its section is in view and give Home back when it leaves', () => {
			// Arrange
			addSection( 'contact' );
			const { menu, items } = buildMenu( [ `${ ORIGIN }/`, `${ ORIGIN }/#contact` ] );
			const [ home, contact ] = items;
			run( menu );
			const [ observer ] = IntersectionObserverMock.instances;

			// Assert: at the top Home is current.
			expect( home.classList.contains( CURRENT_CLASS ) ).toBe( true );
			expect( home.getAttribute( 'aria-current' ) ).toBe( 'page' );

			// Act: the section comes into view.
			observer.trigger( true );

			// Assert
			expect( contact.classList.contains( CURRENT_CLASS ) ).toBe( true );
			expect( contact.getAttribute( 'aria-current' ) ).toBe( 'location' );
			expect( home.classList.contains( CURRENT_CLASS ) ).toBe( false );
			expect( home.hasAttribute( 'aria-current' ) ).toBe( false );

			// Act: scrolled back above the first section.
			observer.trigger( false );

			// Assert
			expect( contact.classList.contains( CURRENT_CLASS ) ).toBe( false );
			expect( contact.hasAttribute( 'aria-current' ) ).toBe( false );
			expect( home.classList.contains( CURRENT_CLASS ) ).toBe( true );
			expect( home.getAttribute( 'aria-current' ) ).toBe( 'page' );
		} );

		it( 'should mark every item that links to the section in view', () => {
			// Arrange
			addSection( 'contact' );
			const { menu, items } = buildMenu( [ `${ ORIGIN }/#contact`, `${ ORIGIN }/#contact` ] );
			run( menu );

			// Act
			IntersectionObserverMock.instances.forEach( ( observer ) => observer.trigger( true ) );

			// Assert
			expect( items.map( ( item ) => item.classList.contains( CURRENT_CLASS ) ) ).toEqual( [ true, true ] );
		} );

		it( 'should never mark an anchor item whose target does not exist', () => {
			// Arrange
			const { menu, items } = buildMenu( [ `${ ORIGIN }/#missing` ] );

			// Act
			run( menu );

			// Assert
			expect( IntersectionObserverMock.instances ).toHaveLength( 0 );
			expect( items[ 0 ].classList.contains( CURRENT_CLASS ) ).toBe( false );
		} );

		it( 'should find a target whose id is not ASCII', () => {
			// Arrange
			addSection( 'צור-קשר' );
			const { menu, items } = buildMenu( [ `${ ORIGIN }/#%D7%A6%D7%95%D7%A8-%D7%A7%D7%A9%D7%A8` ] );
			run( menu );

			// Act
			IntersectionObserverMock.instances[ 0 ].trigger( true );

			// Assert
			expect( items[ 0 ].classList.contains( CURRENT_CLASS ) ).toBe( true );
		} );

		it( 'should ignore an anchor link to another page', () => {
			// Arrange
			addSection( 'contact' );
			const { menu } = buildMenu( [ `${ ORIGIN }/other/#contact` ] );

			// Act
			run( menu );

			// Assert
			expect( IntersectionObserverMock.instances ).toHaveLength( 0 );
		} );

		it( 'should stop observing when the handler is aborted', () => {
			// Arrange
			addSection( 'contact' );
			const { menu } = buildMenu( [ `${ ORIGIN }/#contact` ] );
			const controller = new AbortController();
			run( menu, controller.signal );

			// Act
			controller.abort();

			// Assert
			expect( IntersectionObserverMock.instances[ 0 ].disconnected ).toBe( true );
		} );
	} );
} );
