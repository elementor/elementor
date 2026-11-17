jest.mock( '@elementor/frontend-handlers', () => ( {
	register: jest.fn(),
} ), { virtual: true } );

const CURRENT_CLASS = 'e--current';
const STYLE_STATE_EVENT = 'elementor/editor/style-state/change';

async function loadRegistration() {
	jest.resetModules();
	jest.clearAllMocks();

	await import( 'elementor/modules/atomic-widgets/elements/atomic-menu/handlers/atomic-menu-current-preview-handler' );

	const { register } = jest.requireMock( '@elementor/frontend-handlers' );

	return register.mock.calls.map( ( [ call ] ) => call )[ 0 ];
}

function buildItem( id ) {
	const item = document.createElement( 'a' );
	item.dataset.element_type = 'e-menu-item';
	item.dataset.id = id;
	document.body.append( item );

	return item;
}

function selectState( id, state ) {
	window.dispatchEvent( new CustomEvent( STYLE_STATE_EVENT, { detail: { id, state } } ) );
}

describe( 'menu item current preview handler', () => {
	let registration;
	let controller;

	beforeEach( async () => {
		registration = await loadRegistration();
		controller = new AbortController();
	} );

	afterEach( () => {
		controller.abort();
		document.body.innerHTML = '';
	} );

	function run( item ) {
		registration.callback( { element: item, signal: controller.signal } );
	}

	it( 'should register for the menu item element', () => {
		expect( registration ).toEqual( {
			elementType: 'e-menu-item',
			id: 'e-menu-item-current-preview-handler',
			callback: expect.any( Function ),
		} );
	} );

	it( 'should preview the current state on the selected item only', () => {
		// Arrange
		const selected = buildItem( 'a1' );
		const other = buildItem( 'b2' );
		run( selected );
		run( other );

		// Act
		selectState( 'a1', 'e--current' );

		// Assert
		expect( selected.classList.contains( CURRENT_CLASS ) ).toBe( true );
		expect( other.classList.contains( CURRENT_CLASS ) ).toBe( false );
	} );

	it( 'should drop the preview when the state is cleared', () => {
		// Arrange
		const item = buildItem( 'a1' );
		run( item );
		selectState( 'a1', 'e--current' );

		// Act
		selectState( 'a1', null );

		// Assert
		expect( item.classList.contains( CURRENT_CLASS ) ).toBe( false );
	} );

	it( 'should drop the preview when another element is selected', () => {
		// Arrange
		const item = buildItem( 'a1' );
		run( item );
		selectState( 'a1', 'e--current' );

		// Act
		selectState( 'a1', null );
		selectState( 'z9', null );

		// Assert
		expect( item.classList.contains( CURRENT_CLASS ) ).toBe( false );
	} );

	it( 'should ignore other states', () => {
		// Arrange
		const item = buildItem( 'a1' );
		run( item );

		// Act
		selectState( 'a1', ':hover' );

		// Assert
		expect( item.classList.contains( CURRENT_CLASS ) ).toBe( false );
	} );

	it( 'should keep the preview when the item is rendered again', () => {
		// Arrange
		const first = buildItem( 'a1' );
		run( first );
		selectState( 'a1', 'e--current' );
		const rerendered = buildItem( 'a1' );

		// Act
		run( rerendered );

		// Assert
		expect( rerendered.classList.contains( CURRENT_CLASS ) ).toBe( true );
	} );

	it( 'should mark the previewed item so real detection leaves its class alone', () => {
		// Arrange
		const item = buildItem( 'a1' );
		run( item );

		// Act
		selectState( 'a1', 'e--current' );

		// Assert
		expect( item.getAttribute( 'data-e-preview-state' ) ).toBe( 'e--current' );

		// Act
		selectState( 'a1', null );

		// Assert
		expect( item.hasAttribute( 'data-e-preview-state' ) ).toBe( false );
	} );

	it( 'should never remove a class that real detection set', () => {
		// Arrange
		const item = buildItem( 'a1' );
		item.classList.add( CURRENT_CLASS );
		item.setAttribute( 'aria-current', 'page' );
		run( item );
		selectState( 'a1', 'e--current' );

		// Act
		selectState( 'a1', null );

		// Assert
		expect( item.classList.contains( CURRENT_CLASS ) ).toBe( true );
	} );

	it( 'should stop listening once the element is destroyed', () => {
		// Arrange
		const item = buildItem( 'a1' );
		run( item );
		controller.abort();

		// Act
		selectState( 'a1', 'e--current' );

		// Assert
		expect( item.classList.contains( CURRENT_CLASS ) ).toBe( false );
	} );
} );
