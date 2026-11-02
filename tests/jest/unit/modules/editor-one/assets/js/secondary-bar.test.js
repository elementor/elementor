import { getNextTabIndex, openFinder, scrollActiveTabIntoView, SecondaryBar } from 'elementor/modules/editor-one/assets/js/secondary-bar';

const barMarkup = `
	<nav class="e-admin-secondary-bar" aria-label="Settings section">
		<ul class="e-admin-secondary-bar__tabs">
			<li><a class="e-admin-secondary-bar__tab is-active" href="/settings" aria-current="page">Settings</a></li>
			<li><a class="e-admin-secondary-bar__tab" href="/tools">Tools</a></li>
		</ul>
		<details class="e-admin-secondary-bar__addons">
			<summary>Addons</summary>
			<ul class="e-admin-secondary-bar__addons-menu">
				<li><a class="e-admin-secondary-bar__addons-link" href="/addon-one">One</a></li>
				<li><a class="e-admin-secondary-bar__addons-link" href="/addon-two">Two</a></li>
			</ul>
		</details>
		<button type="button" class="e-admin-secondary-bar__finder" aria-label="Finder"></button>
	</nav>
`;

describe( 'secondary bar', () => {
	afterEach( () => {
		document.body.innerHTML = '';
	} );

	it( 'moves to the next tab and reverses the direction in RTL', () => {
		// Arrange
		const tabCount = 3;

		// Act
		const ltrNext = getNextTabIndex( 0, 'ArrowRight', tabCount, false );
		const rtlNext = getNextTabIndex( 0, 'ArrowRight', tabCount, true );

		// Assert
		expect( ltrNext ).toBe( 1 );
		expect( rtlNext ).toBe( 2 );
	} );

	it( 'opens Finder through the existing route', () => {
		// Arrange
		const route = jest.fn();

		// Act
		const opened = openFinder( route );
		const skipped = openFinder( null );

		// Assert
		expect( opened ).toBe( true );
		expect( route ).toHaveBeenCalledWith( 'finder' );
		expect( skipped ).toBe( false );
	} );

	it( 'scrolls the active tab without animation when reduced motion is set', () => {
		// Arrange
		document.body.innerHTML = barMarkup;
		const activeTab = document.querySelector( '.is-active' );
		activeTab.scrollIntoView = jest.fn();

		// Act
		scrollActiveTabIntoView( document.querySelector( '.e-admin-secondary-bar__tabs' ), true );

		// Assert
		expect( activeTab.scrollIntoView ).toHaveBeenCalledWith( expect.objectContaining( { behavior: 'auto' } ) );
	} );

	it( 'moves focus with the arrow keys and opens Finder from the button', () => {
		// Arrange
		document.body.innerHTML = barMarkup;
		const route = jest.fn();
		const tabs = document.querySelectorAll( '.e-admin-secondary-bar__tab' );
		tabs.forEach( ( tab ) => {
			tab.scrollIntoView = jest.fn();
		} );
		new SecondaryBar( document.querySelector( '.e-admin-secondary-bar' ), { route } ).init();

		// Act
		tabs[ 0 ].dispatchEvent( new KeyboardEvent( 'keydown', { key: 'ArrowRight', bubbles: true } ) );
		document.querySelector( '.e-admin-secondary-bar__finder' ).click();

		// Assert
		expect( document.activeElement ).toBe( tabs[ 1 ] );
		expect( route ).toHaveBeenCalledWith( 'finder' );
	} );

	it( 'moves through a long Addons list from the keyboard', () => {
		// Arrange
		document.body.innerHTML = barMarkup;
		document.querySelectorAll( '.e-admin-secondary-bar__tab' ).forEach( ( tab ) => {
			tab.scrollIntoView = jest.fn();
		} );
		const bar = new SecondaryBar( document.querySelector( '.e-admin-secondary-bar' ) );
		bar.init();
		const addons = document.querySelector( '.e-admin-secondary-bar__addons' );
		const summary = addons.querySelector( 'summary' );
		const links = addons.querySelectorAll( 'a' );
		summary.focus();

		// Act
		addons.dispatchEvent( new KeyboardEvent( 'keydown', { key: 'ArrowDown', bubbles: true } ) );
		const opened = addons.open;
		const firstFocus = document.activeElement;
		addons.dispatchEvent( new KeyboardEvent( 'keydown', { key: 'ArrowDown', bubbles: true } ) );
		const secondFocus = document.activeElement;
		addons.dispatchEvent( new KeyboardEvent( 'keydown', { key: 'Escape', bubbles: true } ) );

		// Assert
		expect( opened ).toBe( true );
		expect( firstFocus ).toBe( links[ 0 ] );
		expect( secondFocus ).toBe( links[ 1 ] );
		expect( document.activeElement ).toBe( summary );
		expect( addons.open ).toBe( false );
	} );
} );
