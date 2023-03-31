const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../pages/wp-admin-page' );

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

		await test.step( 'Assert grid auto flow', async () => {
			await editor.setSelectControlValue( 'grid_auto_flow', 'row' );
			await expect( container ).toHaveCSS( 'grid-auto-flow', 'row' );
			await editor.setSelectControlValue( 'grid_auto_flow', 'column' );
			await expect( container ).toHaveCSS( 'grid-auto-flow', 'column' );
		} );

		await test.step( 'Assert that the drag area is visible when using boxed width', async () => {
			await page.selectOption( '.elementor-control-content_width >> select', 'boxed' );
			const dragAreaIsVisible = await editor.getPreviewFrame().locator( '.elementor-empty-view' ).evaluate( ( element ) => {
				return 200 < element.offsetWidth;
			} );
			await expect( dragAreaIsVisible ).toBeTruthy();
		} );

		await test.step( 'Assert boxed width content alignment', async () => {
			await page.selectOption( '.elementor-control-content_width >> select', 'boxed' );
			await page.locator( '.elementor-control-grid_columns_grid .elementor-slider-input input' ).fill( '' );

			// Add flex container.
			const flexContainerId = await editor.addElement( { elType: 'container' }, 'document' );

			// Assert.
			const gridDragAreaOffsetLeft = await editor.getPreviewFrame().locator( '.e-grid .elementor-empty-view' ).evaluate( ( gridContent ) => gridContent.offsetLeft ),
				flexDragAreaOffsetLeft = await editor.getPreviewFrame().locator( '.e-flex .elementor-empty-view' ).evaluate( ( flexContent ) => flexContent.offsetLeft );

			await expect( gridDragAreaOffsetLeft ).toEqual( flexDragAreaOffsetLeft );

			// Add heading.
			await editor.addWidget( 'heading', flexContainerId );
			await editor.getPreviewFrame().waitForSelector( '.elementor-widget-heading' );

			// Assert.
			const headingOffsetLeft = await editor.getPreviewFrame().locator( '.elementor-widget-heading' ).evaluate( ( heading ) => heading.offsetLeft );
			await expect( gridDragAreaOffsetLeft ).toEqual( headingOffsetLeft );

			// Remove flex container.
			await editor.removeElement( flexContainerId );
		} );

		await test.step( 'Assert mobile is in one column', async () => {
			// Open responsive bar and select mobile view
			await page.locator( '#elementor-panel-footer-responsive i' ).click();
			await page.waitForSelector( '#e-responsive-bar' );
			await page.locator( '#e-responsive-bar-switcher__option-mobile' ).click();

			const gridTemplateColumnsCssValue = await container.evaluate( ( element ) => {
				return window.getComputedStyle( element ).getPropertyValue( 'grid-template-columns' );
			} );

			const isOneColumn = ! hasWhiteSpace( gridTemplateColumnsCssValue );

			expect( isOneColumn ).toBeTruthy();
		} );
	} );

	test( 'Grid container presets', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = await wpAdmin.useElementorCleanPost();
		const frame = await editor.getPreviewFrame();

		await test.step( 'Assert preset: rows-0 columns-2', async () => {
			await frame.locator( '.elementor-add-section-button' ).click();
			await frame.locator( '.grid-preset-button' ).click();
			await frame.locator( '[data-preset="0-2"]' ).click();
			const container = await frame.locator( '.e-con.e-grid > .e-con-inner' );
			await expect( container ).toHaveCSS( 'grid-template-rows', '100px' );
			await expect( container ).toHaveCSS( 'grid-template-columns', '560px 560px' );
			await editor.cleanContent();
		} );

		await test.step( 'Assert preset: rows-2 columns-0', async () => {
			await frame.locator( '.elementor-add-section-button' ).click();
			await frame.locator( '.grid-preset-button' ).click();
			await frame.locator( '[data-preset="2-0"]' ).click();
			const container = await frame.locator( '.e-con.e-grid > .e-con-inner' );
			await expect( container ).toHaveCSS( 'grid-template-rows', '100px 100px' );
			await expect( container ).toHaveCSS( 'grid-template-columns', '0px' );
			await editor.cleanContent();
		} );

		await test.step( 'Assert preset: rows-0 columns-3', async () => {
			await frame.locator( '.elementor-add-section-button' ).click();
			await frame.locator( '.grid-preset-button' ).click();
			await frame.locator( '[data-preset="0-3"]' ).click();
			const container = await frame.locator( '.e-con.e-grid > .e-con-inner' );
			await expect( container ).toHaveCSS( 'grid-template-rows', '100px' );
			await expect( container ).toHaveCSS( 'grid-template-columns', '366.656px 366.672px 366.672px' );
			await editor.cleanContent();
		} );

		await test.step( 'Assert preset: rows-3 columns-0', async () => {
			await frame.locator( '.elementor-add-section-button' ).click();
			await frame.locator( '.grid-preset-button' ).click();
			await frame.locator( '[data-preset="3-0"]' ).click();
			const container = await frame.locator( '.e-con.e-grid > .e-con-inner' );
			await expect( container ).toHaveCSS( 'grid-template-rows', '100px 100px 100px' );
			await expect( container ).toHaveCSS( 'grid-template-columns', '0px' );
			await editor.cleanContent();
		} );

		await test.step( 'Assert preset: rows-2 columns-2', async () => {
			await frame.locator( '.elementor-add-section-button' ).click();
			await frame.locator( '.grid-preset-button' ).click();
			await frame.locator( '[data-preset="2-2"]' ).click();
			const container = await frame.locator( '.e-con.e-grid > .e-con-inner' );
			await expect( container ).toHaveCSS( 'grid-template-rows', '100px 100px' );
			await expect( container ).toHaveCSS( 'grid-template-columns', '560px 560px' );
			await editor.cleanContent();
		} );

		await test.step( 'Assert preset: rows-3 columns-3', async () => {
			await frame.locator( '.elementor-add-section-button' ).click();
			await frame.locator( '.grid-preset-button' ).click();
			await frame.locator( '[data-preset="3-3"]' ).click();
			const container = await frame.locator( '.e-con.e-grid > .e-con-inner' );
			await expect( container ).toHaveCSS( 'grid-template-rows', '100px 100px 100px' );
			await expect( container ).toHaveCSS( 'grid-template-columns', '366.656px 366.672px 366.672px' );
			await editor.cleanContent();
		} );
	} );
} );

function hasWhiteSpace( s ) {
	return /\s/g.test( s );
}
