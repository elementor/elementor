const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../pages/wp-admin-page.js' );

test( 'Accordion', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo ),
		editor = await wpAdmin.useElementorCleanPost();

  // Close Navigator
  await page.click( '#elementor-navigator__close' );

	// Act.
	await editor.addWidget( 'accordion' );

  expect( await editor.getPreviewFrame().locator( '.elementor-widget-wrap > .elementor-background-overlay' ).screenshot( { type: 'jpeg', quality: 70 } ) ).toMatchSnapshot( 'accordion.jpeg' );
} );
