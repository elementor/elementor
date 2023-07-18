const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../../../../pages/wp-admin-page' );

test.describe( 'Global color introduction tests', () => {
	test( 'Check if globals introduction tooltip is being triggered by clicking on the color picker', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.useElementorCleanPost();

		await page.evaluate( () => {
			elementor.config.user.introduction.globals_introduction = false;

			// Register the tooltips again after we set the introduction to false.
			elementor.introductionTooltips.registerTooltips();
		} );

		// Act.
		await editor.addWidget( 'heading' );
		await editor.activatePanelTab( 'style' );
		await page.click( '.pickr' );
		let tooltipDialogCounter = await page.getByText( 'Check out Global Colors' ).count();

		// Assert.
		expect( tooltipDialogCounter ).toBe( 1 );
	} );

	test( 'Check if globals introduction tooltip is not being triggered twice', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.useElementorCleanPost();

		await page.evaluate( () => {
			elementor.config.user.introduction.globals_introduction = true;

			// Register the tooltips again after we set the introduction to false.
			elementor.introductionTooltips.registerTooltips();
		} );

		// Act.
		await editor.addWidget( 'heading' );
		await editor.activatePanelTab( 'style' );
		await page.click( '.pickr' );
		let tooltipDialogCounter = await page.getByText( 'Check out Global Colors' ).count();

		// Assert.
		expect( tooltipDialogCounter ).toBe( 0 );
	} );
} );
