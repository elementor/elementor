const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../../../../pages/wp-admin-page' );

test.describe( 'Globals introduction tests', () => {
	test( 'Check if globals introduction tooltip is being triggered by clicking on the color picker', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.useElementorCleanPost();

		await page.evaluate( () => {
			elementor.config.user.introduction.globals_introduction_tooltip = false;

			// Register the tooltips again after we set the introduction to false.
			elementor.tooltips.registerTooltips();
		} );

		// Act.
		await editor.addWidget( 'heading' );
		await editor.activatePanelTab( 'style' );
		await page.click( '.pickr' );
		let tooltipDialogCounter = await page.locator( '.dialog-tooltip-widget' ).count();

		// Assert.
		expect( tooltipDialogCounter ).toBe( 1 );
	} );
} );
