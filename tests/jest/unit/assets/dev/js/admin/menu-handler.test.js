const PATH = 'edit.php?post_type=elementor_library&tabs_group=popup&elementor_library_type=popup';

// Minimal jQuery stand-in: jQuery is not available in the root jest environment.
const createJQueryMock = () => {
	const wrap = ( elements ) => ( {
		length: elements.length,
		removeClass: ( classes ) => {
			elements.forEach( ( el ) => el.classList.remove( ...classes.split( ' ' ) ) );

			return wrap( elements );
		},
		addClass: ( classes ) => {
			elements.forEach( ( el ) => el.classList.add( ...classes.split( ' ' ) ) );

			return wrap( elements );
		},
		parent: () => wrap( elements.map( ( el ) => el.parentElement ) ),
	} );

	return ( selector ) => wrap( Array.from( document.querySelectorAll( selector ) ) );
};

// Mirrors the real ViewModule contract: settings are built from defaults, then elements, then onInit.
class ViewModuleMock {
	constructor( settings = {} ) {
		this.settings = { ...this.getDefaultSettings(), ...settings };
		this.onInit();
	}

	getSettings() {
		return this.settings;
	}

	getDefaultSettings() {
		return {};
	}

	getDefaultElements() {
		return {};
	}

	onInit() {
		this.elements = this.getDefaultElements();
	}
}

const buildAdminMenu = () => {
	document.body.innerHTML = `
		<ul id="adminmenu">
			<li id="popups-item" class="current"><a href="admin.php?page=elementor-popups">Popups</a></li>
			<li id="legacy-item"><a href="${ PATH }">Legacy Popups</a></li>
			<li id="other-item" class="current"><a href="admin.php?page=elementor">Editor</a></li>
		</ul>
	`;
};

const hasCurrent = ( id ) => document.getElementById( id ).classList.contains( 'current' );

describe( 'MenuHandler', () => {
	const originalLocation = window.location;
	let MenuHandlerClass;

	beforeEach( () => {
		global.jQuery = createJQueryMock();
		global.elementorModules = { ViewModule: ViewModuleMock };

		// The module extends elementorModules.ViewModule at load time, so re-import after the global is set.
		jest.isolateModules( () => {
			MenuHandlerClass = require( 'elementor-admin/menu-handler' ).default;
		} );

		delete window.location;
		window.location = new URL( `https://example.com/wp-admin/${ PATH }` );
		buildAdminMenu();
	} );

	afterEach( () => {
		document.body.className = '';
		document.body.innerHTML = '';
		delete window.location;
		window.location = originalLocation;
	} );

	it( 'should keep the server-resolved current item when the admin navigation is active', () => {
		// Arrange.
		document.body.classList.add( 'e-admin-navigation-active' );

		// Act.
		new MenuHandlerClass( { path: PATH } );

		// Assert.
		expect( hasCurrent( 'popups-item' ) ).toBe( true );
		expect( hasCurrent( 'other-item' ) ).toBe( true );
		expect( hasCurrent( 'legacy-item' ) ).toBe( false );
		expect( document.querySelector( `a[href="${ PATH }"]` ).classList.contains( 'current' ) ).toBe( false );
	} );

	it( 'should not touch top level items when the admin navigation is active', () => {
		// Arrange.
		document.body.classList.add( 'e-admin-navigation-active' );
		const handler = new MenuHandlerClass( { path: PATH } );
		const $toHighlight = global.jQuery( '#legacy-item a' );

		// Act.
		handler.highlightTopLevelMenuItem( $toHighlight );

		// Assert.
		expect( hasCurrent( 'legacy-item' ) ).toBe( false );
	} );

	it( 'should keep the legacy highlighting when the admin navigation is not active', () => {
		// Act.
		new MenuHandlerClass( { path: PATH } );

		// Assert.
		expect( hasCurrent( 'popups-item' ) ).toBe( false );
		expect( hasCurrent( 'other-item' ) ).toBe( false );
		expect( document.querySelector( `a[href="${ PATH }"]` ).classList.contains( 'current' ) ).toBe( true );
		expect( hasCurrent( 'legacy-item' ) ).toBe( true );
	} );
} );
