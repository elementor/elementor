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

	test( 'Test grid container', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = await wpAdmin.useElementorCleanPost();

		// Arrange.
		await test.step( 'Arrange', async () => {
			await editor.addElement( { elType: 'container' }, 'document' );
			await editor.closeNavigatorIfOpen();
			await editor.setSelectControlValue( 'container_type', 'grid' );
		} );

		const frame = editor.getPreviewFrame();
		const container = await frame.locator( '.e-grid .e-con-inner' );

		await test.step( 'Assert gaps', async () => {
			await page.locator( '.elementor-control-gaps .elementor-link-gaps' ).first().click();
			await page.locator( '.elementor-control-gaps .elementor-control-gap:nth-child(1) input' ).first().fill( '10' );
			await page.locator( '.elementor-control-gaps .elementor-control-gap:nth-child(2) input' ).first().fill( '20' );
			await expect( container ).toHaveCSS( 'gap', '20px 10px' );
		} );

		await test.step( 'Assert justify and align start', async () => {
			await page.locator( '.elementor-control-grid_justify_content [data-tooltip="Start"]' ).click();
			await page.locator( '.elementor-control-grid_align_content [data-tooltip="Start"]' ).click();
			await expect( container ).toHaveCSS( 'justify-content', 'start' );
			await expect( container ).toHaveCSS( 'align-content', 'start' );
		} );

		await test.step( 'Assert justify align and content middle', async () => {
			await page.locator( '.elementor-control-grid_justify_content [data-tooltip="Middle"]' ).click();
			await page.locator( '.elementor-control-grid_align_content [data-tooltip="Middle"]' ).click();
			await expect( container ).toHaveCSS( 'justify-content', 'center' );
			await expect( container ).toHaveCSS( 'align-content', 'center' );
		} );

		await test.step( 'Assert justify align and content end', async () => {
			await page.locator( '.elementor-control-grid_justify_content [data-tooltip="End"]' ).click();
			await page.locator( '.elementor-control-grid_align_content [data-tooltip="End"]' ).click();
			await expect( container ).toHaveCSS( 'justify-content', 'end' );
			await expect( container ).toHaveCSS( 'align-content', 'end' );
		} );
	} );
} );
