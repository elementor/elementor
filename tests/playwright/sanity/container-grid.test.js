const { test, expect } = require( '@playwright/test' );
const { getElementSelector } = require( '../assets/elements-utils' );
const WpAdminPage = require( '../pages/wp-admin-page' );
const widgets = require( '../enums/widgets.js' );
const Breakpoints = require( '../assets/breakpoints' );

test.describe( 'Container tests', () => {
	test.beforeAll( async ( { browser }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			container: true,
			container_grid: true,
		} );
	} );

	test.afterAll( async ( { browser }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			container: false,
			container_grid: false,
		} );
	} );

	test( 'Test grid container gap', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = await wpAdmin.useElementorCleanPost();

		// Add container.
		await editor.addElement( { elType: 'container' }, 'document' );

		// Close Navigator
		await editor.closeNavigatorIfOpen();

		// Set container type to grid.
		await editor.setSelectControlValue( 'container_type', 'grid' );

		// Set gap.
		await page.locator( '.elementor-control-gaps .elementor-link-gaps' ).first().click();
		await page.locator( '.elementor-control-gaps .elementor-control-gap:nth-child(1) input' ).first().fill( '10' );
		await page.locator( '.elementor-control-gaps .elementor-control-gap:nth-child(2) input' ).first().fill( '20' );

		// Assert.
		const frame = editor.getPreviewFrame();
		const container = await frame.locator( '.e-grid .e-con-inner' );
		await expect( container ).toHaveCSS( 'gap', '20px 10px' );
	} );
} );
