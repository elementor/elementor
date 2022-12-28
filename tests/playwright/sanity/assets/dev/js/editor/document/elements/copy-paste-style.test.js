const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../../../../../pages/wp-admin-page' );

test( 'A page can be saved successfully after copy-paste style', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo );
	const editor = await wpAdmin.useElementorCleanPost();

	// Close Navigator
	await editor.closeNavigatorIfOpen();

	const heading1 = await editor.addWidget( 'heading' );
	const heading2 = await editor.addWidget( 'heading' );

	await editor.selectElement( heading1 );

	await editor.activatePanelTab( 'style' );

	await page.locator( '.elementor-control-title_color .pcr-button' ).click();
	await page.locator( '.pcr-app.visible .pcr-interaction input.pcr-result' ).fill( '#77A5BD' );

	// Act.
	await editor.copyElement( heading1 );

	await editor.pasteStyleElement( heading2 );

	const heading2Title = await editor.getFrame().locator( '.elementor-element-' + heading2 + ' .elementor-heading-title' );

	// Assert.
	await expect( heading2Title ).toHaveCSS( 'color', 'rgb(119, 165, 189)' );

	const publishButton = page.locator( '#elementor-panel-saver-button-publish' );

	// Check that the panel footer save button is green.
	await expect( publishButton ).toHaveCSS( 'background-color', 'rgb(57, 181, 74)' );

	// Act.
	await publishButton.click();
	await page.waitForLoadState( 'networkidle' );

	// Assert.
	await expect( page.locator( '#elementor-panel-saver-button-publish' ) ).toHaveCSS( 'background-color', 'rgb(85, 96, 104)' );
} );
