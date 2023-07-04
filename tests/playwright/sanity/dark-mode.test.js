const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../pages/wp-admin-page.js' );
const { setExperiment } = require( '../utilities/rest-api' );

test( 'navigator empty placeholder should be in dark mode', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo );
	await setExperiment( 'container', true );

	const editor = await wpAdmin.useElementorCleanPost();

	// Act.
	await editor.addElement( { elType: 'container' }, 'document' );
	await editor.changeUiTheme( 'dark' );
	const navigator = await editor.page.locator( '#elementor-navigator' );
	await navigator.locator( '.elementor-navigator__element__list-toggle' ).click();

	// Assert
	expect( await navigator.screenshot( {
		type: 'jpeg',
		quality: 70,
	} ) ).toMatchSnapshot( 'navigator-empty-dark-mode.jpg' );
} );
