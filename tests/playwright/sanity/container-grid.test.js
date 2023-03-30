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
	} );

	test.only( 'Test grid outline', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = await wpAdmin.useElementorCleanPost();

		// Arrange.
		await test.step( 'Arrange', async () => {
			await editor.addElement( { elType: 'container' }, 'document' );
			await editor.closeNavigatorIfOpen();
			await editor.setSelectControlValue( 'container_type', 'grid' );
		} );

		const frame = editor.getPreviewFrame();
		const gridOutline = await frame.locator( '.e-grid-outline' ),
			gridOutlineChildren = await frame.locator( '.e-grid-outline-item' ),
			gridOutlineChildrenInitialValue = 6;

		await test.step( 'Assert default outline', async () => {
			await expect( gridOutline ).toBeVisible();
			await expect( gridOutlineChildren ).toHaveCount( gridOutlineChildrenInitialValue );
		} );

		await test.step( 'Assert outline shut down', async () => {
			await editor.setSwitcherControlValue( 'grid_outline', false );
			await expect( gridOutline ).not.toBeVisible();
		} );

		await test.step( 'Assert outline turn on', async () => {
			await page.pause();
			await editor.setSwitcherControlValue( 'grid_outline', true );
			await expect( gridOutline ).toBeVisible();
		} );

		await test.step( 'not visible when container is not in focus', async () => {
			await page.locator( 'h1' ).first().click();
			await expect( gridOutline ).not.toBeVisible();
		} );

		await page.pause();
	} );
} );
