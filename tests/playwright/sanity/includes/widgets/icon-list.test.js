const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../pages/wp-admin-page.js' );

test.describe( 'Icon List', () => {
	test( 'Test vertical alignment of the icons', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = await wpAdmin.useElementorCleanPost();

		// Act.
		await editor.addWidget( 'icon-list' );
		// Open 'Style' tab.
		await editor.activatePanelTab( 'style' );
		// Open 'icon' panel.
		await page.locator( '.elementor-control-section_icon_style' ).click();
		// Select vertical alignment option.
		await page.locator( '.elementor-control-icon_self_vertical_align .eicon-v-align-top' ).click();
		// Set vertical offset value.
		await page.locator( '.elementor-control-icon_vertical_offset input' ).fill( '10' );

		await page.pause();

		// Assert.
		// await expect( 'selector' ).toHaveCSS( 'padding-top', '10px' );
		// await expect( editor.page.locator( '.elementor-control-raw-html.elementor-panel-alert.elementor-panel-alert-info' ) )
		// 	.toContainText( 'You are currently editing a Tabs Widget in its old version.' );
	} );
} );
