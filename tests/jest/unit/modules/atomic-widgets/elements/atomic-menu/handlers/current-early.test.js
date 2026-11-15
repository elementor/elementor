const ORIGIN = 'http://localhost';
const CURRENT_CLASS = 'e--current';

function buildMenu( links ) {
	const menu = document.createElement( 'nav' );

	const items = links.map( ( href ) => {
		const item = document.createElement( 'a' );
		item.dataset.element_type = 'e-menu-item';
		item.setAttribute( 'href', href );
		menu.append( item );

		return item;
	} );

	const script = document.createElement( 'script' );
	menu.append( script );
	document.body.append( menu );

	return { items, script };
}

function runEarlyScript( script ) {
	Object.defineProperty( document, 'currentScript', { value: script, configurable: true } );

	jest.isolateModules( () => {
		require( 'elementor/modules/atomic-widgets/elements/atomic-menu/handlers/current-early' );
	} );
}

describe( 'menu current early script', () => {
	afterEach( () => {
		document.body.innerHTML = '';
		delete document.currentScript;
	} );

	it( 'should mark the item that links to the current page before the handler runs', () => {
		// Arrange
		const { items, script } = buildMenu( [ `${ ORIGIN }/`, `${ ORIGIN }/about/`, 'https://example.com/' ] );

		// Act
		runEarlyScript( script );

		// Assert
		expect( items[ 0 ].classList.contains( CURRENT_CLASS ) ).toBe( true );
		expect( items[ 0 ].getAttribute( 'aria-current' ) ).toBe( 'page' );
		expect( items[ 1 ].classList.contains( CURRENT_CLASS ) ).toBe( false );
		expect( items[ 2 ].classList.contains( CURRENT_CLASS ) ).toBe( false );
	} );

	it( 'should leave the menu to the handler when it has an anchor link to the current page', () => {
		// Arrange
		const { items, script } = buildMenu( [ `${ ORIGIN }/`, `${ ORIGIN }/#contact` ] );

		// Act
		runEarlyScript( script );

		// Assert
		items.forEach( ( item ) => {
			expect( item.classList.contains( CURRENT_CLASS ) ).toBe( false );
			expect( item.hasAttribute( 'aria-current' ) ).toBe( false );
		} );
	} );

	it( 'should not mark a placeholder hash link', () => {
		// Arrange
		const { items, script } = buildMenu( [ '#' ] );

		// Act
		runEarlyScript( script );

		// Assert
		expect( items[ 0 ].classList.contains( CURRENT_CLASS ) ).toBe( false );
	} );

	it( 'should do nothing when it is not run from a script inside a menu', () => {
		// Arrange
		const { items } = buildMenu( [ `${ ORIGIN }/` ] );

		// Act
		runEarlyScript( null );

		// Assert
		expect( items[ 0 ].classList.contains( CURRENT_CLASS ) ).toBe( false );
	} );
} );

describe( 'menu current early script source', () => {
	it( 'should not contain an ampersand, which WordPress content filters rewrite into an entity', () => {
		// Arrange
		const fs = require( 'fs' );
		const dir = require( 'path' ).resolve( __dirname, '../../../../../../../../modules/atomic-widgets/elements/atomic-menu/handlers' );

		// Act
		const sources = [ 'current-early.js', 'current-state.js', 'url-matcher.js' ].map( ( file ) => fs.readFileSync( `${ dir }/${ file }`, 'utf8' ) );

		// Assert
		sources.forEach( ( source ) => expect( source ).not.toContain( '&' ) );
	} );
} );
