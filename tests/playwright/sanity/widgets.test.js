const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../pages/wp-admin-page' );

test.describe( 'Widget tests', () => {
    test( 'Widget Transform controls', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			container: true,
		} );

		// Arrange.
		const editor = await wpAdmin.useElementorCleanPost(),
			containerId = await editor.addElement( { elType: 'container' }, 'document' ),
            widgetId = await editor.addWidget( 'heading', containerId ),
			widgetContainerSelector = '.elementor-edit-mode .elementor-element-' + widgetId + ' > .elementor-widget-container';

		// Act.
		await editor.activatePanelTab( 'advanced' );
		await page.locator( '.elementor-control-_section_transform .elementor-panel-heading-title' ).click();
		// Set rotation.
		await page.locator( '.elementor-control-_transform_rotate_popover .elementor-control-popover-toggle-toggle-label' ).click();
		await page.locator( '.elementor-control-_transform_rotateZ_effect .elementor-control-input-wrapper input' ).fill( '2' );
		await page.locator( '.elementor-control-_transform_rotate_popover .elementor-control-popover-toggle-toggle-label' ).click();
		// Set scale.
		await page.locator( '.elementor-control-_transform_scale_popover .elementor-control-popover-toggle-toggle-label' ).click();
		await page.locator( '.elementor-control-_transform_scale_effect .elementor-control-input-wrapper input' ).fill( '2' );
		await page.locator( '.elementor-control-_transform_scale_popover .elementor-control-popover-toggle-toggle-label' ).click();

		// Assert.
		// Check rotate and scale value.
		await expect( editor.getPreviewFrame().locator( widgetContainerSelector ) ).toHaveCSS( '--e-transform-rotateZ', '2deg' );
		await expect( editor.getPreviewFrame().locator( widgetContainerSelector ) ).toHaveCSS( '--e-transform-scale', '2' );
	} );
} );
