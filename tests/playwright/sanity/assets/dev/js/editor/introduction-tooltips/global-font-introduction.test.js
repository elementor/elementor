const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../../../../pages/wp-admin-page' );

test.describe( 'Global font introduction tests', () => {
	test( 'Check if globals introduction tooltip is being triggered by clicking on the font popover', async ( { page }, testInfo ) => {
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
		await page.click( '.elementor-control-typography_typography .elementor-control-popover-toggle-toggle-label' );
		let tooltipDialogCounter = await page.getByText( 'Check out Global Fonts' ).count();

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
		await page.click( '.elementor-control-typography_typography .elementor-control-popover-toggle-toggle-label' );
		let tooltipDialogCounter = await page.getByText( 'Check out Global Fonts' ).count();

		// Assert.
		expect( tooltipDialogCounter ).toBe( 0 );
	} );
} );
