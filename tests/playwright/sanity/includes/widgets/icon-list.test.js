const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../pages/wp-admin-page.js' );

test.describe( 'Icon List', () => {
	test( 'Test vertical alignment of the icons', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.useElementorCleanPost();

		// Act.
		await editor.addWidget( 'icon-list' );
		// Open 'Style' tab.
		await editor.activatePanelTab( 'style' );
		// Open 'icon' panel.
		await page.locator( '.elementor-control-section_icon_style' ).click();
		// Select vertical alignment option.
		await page.locator( '.elementor-control-icon_self_vertical_align .eicon-v-align-top' ).click();
		// Set vertical offset value.
		await page.locator( '.elementor-control-icon_vertical_offset .elementor-slider-input input' ).fill( '10' );

		// Assert.
		await expect( editor.getPreviewFrame().locator( '.elementor-icon-list-item' ).first() ).toHaveCSS( 'align-items', 'flex-start' );
		await expect( editor.getPreviewFrame().locator( '.elementor-icon-list-icon' ).first() ).toHaveCSS( 'top', '10px' );
	} );
} );
