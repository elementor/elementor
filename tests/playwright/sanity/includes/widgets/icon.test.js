const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../pages/wp-admin-page.js' );

test( 'Enable Icon Aspect Ratio', async ( { page }, testInfo ) => {
	const wpAdmin = new WpAdminPage( page, testInfo );
	const editor = await wpAdmin.useElementorCleanPost();
	const frame = page.frameLocator( '#elementor-preview-iframe' );

	await test.step( 'Act', async () => {
		await editor.addWidget( 'icon' );

		await page.locator( '.elementor-control-media__preview' ).hover();
		await page.getByText( 'Upload SVG' ).click();
		await page.getByRole( 'tab', { name: 'Media Library' } ).click();

		await page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/test-svg-wide.svg' );
		// Await page.getByRole( 'checkbox', { name: 'test-svg-wide' } ).first().click();
		await page.getByRole( 'button', { name: 'Insert Media' } ).click();

		await page.getByRole( 'button', { name: 'Style' } ).click();
		await page.locator( '.elementor-switch-label' ).click();
		await page.getByRole( 'spinbutton', { name: 'Size' } ).fill( '300' );
	} );

	await test.step( 'Editor Aspect Ratio updated', async () => {
		await editor.togglePreviewMode();
		const icon = frame.locator( '.elementor-icon' );

		await expect( icon ).toHaveClass( /e-icon-fit/ );

		const iconDimensions = await page.evaluate( () => {
			const element = document.querySelector( '.elementor-icon' );
			return {
				width: element.offsetWidth,
				height: element.offsetHeight,
			};
		} );

		await expect( iconDimensions.height === iconDimensions.width ).toBeFalsy(); // Not 1-1 proportion

		await editor.togglePreviewMode();
	} );

	await test.step( 'FrontEnd Aspect Ratio updated', async () => {
		await editor.publishAndViewPage();

		const iconDimensions = await page.evaluate( () => {
			const element = document.querySelector( '.elementor-icon' );
			return {
				width: element.offsetWidth,
				height: element.offsetHeight,
			};
		} );

		await expect( iconDimensions.height === iconDimensions.width ).toBeFalsy(); // Not 1-1 proportion

		const icon = page.locator( '.elementor-icon' );

		await expect( icon ).toHaveClass( /e-icon-fit/ );
	} );
} );

