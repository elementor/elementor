const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../pages/wp-admin-page.js' );

test( 'Enable SVG fit-to-size', async ( { page }, testInfo ) => {
	const wpAdmin = new WpAdminPage( page, testInfo );
	await wpAdmin.enableAdvancedUploads();
	const editor = await wpAdmin.useElementorCleanPost(),
		iconWidget = await editor.addWidget( 'icon' ),
		iconSelector = '.elementor-element-' + iconWidget + ' .elementor-icon';

	await test.step( 'Fit Aspect hidden for Icons', async () => {
		await page.getByRole( 'button', { name: 'Style' } ).click();
		await expect( await page.locator( '.elementor-control-fit_to_size .elementor-switch-label' ) ).toBeHidden();
	} );

	await test.step( 'Act', async () => {
		await page.getByRole( 'button', { name: 'Content' } ).click();
		const mediaUploadControl = await page.locator( '.elementor-control-media__preview' );
		await mediaUploadControl.hover();
		await mediaUploadControl.waitFor();

		await page.getByText( 'Upload SVG' ).click();

		await page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/test-svg-wide.svg' );
		await page.getByRole( 'button', { name: 'Insert Media' } ).click();

		await page.getByRole( 'button', { name: 'Style' } ).click();
		await page.locator( '.elementor-switch-label' ).click();
		await page.getByRole( 'spinbutton', { name: 'Size' } ).fill( '300' );
	} );

	await test.step( 'Editor Fit-to-size enabled', async () => {
		await editor.togglePreviewMode();

		const iconSVG = await editor.getPreviewFrame().locator( iconSelector ),
			iconDimensions = await iconSVG.boundingBox();

		await expect( iconDimensions.height !== iconDimensions.width ).toBeTruthy(); // Not 1-1 proportion
		await editor.togglePreviewMode();
	} );

	await test.step( 'FrontEnd Fit-to-size enabled', async () => {
		await editor.publishAndViewPage();

		await page.waitForSelector( '.elementor-element-' + iconWidget + ' .elementor-icon' );

		const iconSVG = await page.locator( iconSelector ),
			iconDimensions = await iconSVG.boundingBox();

		await expect( iconDimensions.height === iconDimensions.width ).toBeFalsy(); // Not 1-1 proportion
	} );

	await wpAdmin.disableAdvancedUploads();
} );

