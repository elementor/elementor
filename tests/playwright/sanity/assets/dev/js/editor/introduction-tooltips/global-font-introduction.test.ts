import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../../../parallelTest';
import WpAdminPage from '../../../../../../pages/wp-admin-page';

test.describe( 'Global font introduction tests', () => {
	test( 'Check if globals introduction tooltip is being triggered by clicking on the font popover', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			editor = await wpAdmin.openNewPage();

		await page.evaluate( () => {
			elementor.config.user.introduction.globals_introduction = false;

			// Register the tooltips again after we set the introduction to false.
			elementor.introductionTooltips.registerTooltips();
		} );

		// Act.
		await editor.addWidget( { widgetType: 'heading' } );
		await editor.openPanelTab( 'style' );
		await page.click( '.elementor-control-typography_typography .elementor-control-popover-toggle-toggle-label' );
		const tooltipDialogCounter = await page.getByText( 'Check out Global Fonts' ).count();

		// Assert.
		expect( tooltipDialogCounter ).toBe( 1 );
	} );

	test( 'Check if globals introduction tooltip is not being triggered twice', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			editor = await wpAdmin.openNewPage();

		await page.evaluate( () => {
			elementor.config.user.introduction.globals_introduction = true;

			// Register the tooltips again after we set the introduction to false.
			elementor.introductionTooltips.registerTooltips();
		} );

		// Act.
		await editor.addWidget( { widgetType: 'heading' } );
		await editor.openPanelTab( 'style' );
		await page.click( '.elementor-control-typography_typography .elementor-control-popover-toggle-toggle-label' );
		const tooltipDialogCounter = await page.getByText( 'Check out Global Fonts' ).count();

		// Assert.
		expect( tooltipDialogCounter ).toBe( 0 );
	} );
} );
