const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../pages/wp-admin-page' );

test.describe( 'Nested Tabs tests', () => {
	test( 'Count the number of icons inside the Add Section element', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			container: true,
			'nested-elements': true,
		} );

		const editor = await wpAdmin.useElementorCleanPost(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs-content .e-con.e-active' );

		// Act.
		const iconCountForTabs = await editor.getPreviewFrame().locator( '.e-n-tabs-content .e-con.e-active .elementor-add-new-section i' ).count(),
			iconCountForMainContainer = await editor.getPreviewFrame().locator( '#elementor-add-new-section .elementor-add-new-section i' ).count();

		// Assert.
		// Check if the tabs has 1 icon in the Add Section element and the main container 2 icons.
		expect( iconCountForTabs ).toBe( 1 );
		expect( iconCountForMainContainer ).toBe( 2 );

		await wpAdmin.setExperiments( {
			container: false,
			'nested-elements': false,
		} );
	} );

	test( 'Title alignment setting', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			container: true,
			'nested-elements': true,
		} );

		const editor = await wpAdmin.useElementorCleanPost(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs-content .e-con.e-active' );

		// Act.
		// Set tabs direction to 'stretch'.
		await page.locator( '.elementor-control-tabs_justify_horizontal .elementor-control-input-wrapper .eicon-h-align-stretch' ).click();
		// Set align title to 'start'.
		await page.locator( '.elementor-control-title_alignment .elementor-control-input-wrapper .eicon-text-align-left' ).click();

		// Assert.
		// Check if title's are aligned on the left.
		await expect( editor.getPreviewFrame().locator( '.elementor-widget-n-tabs .e-n-tabs-heading .e-n-tab-title.e-active' ) ).toHaveCSS( 'justify-content', 'flex-start' );

		await wpAdmin.setExperiments( {
			container: false,
			'nested-elements': false,
		} );
	} );

	test( 'Responsive breakpoints for Nested Tabs', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			container: true,
			'nested-elements': true,
		} );

		const editor = await wpAdmin.useElementorCleanPost(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( 'tabs-v2', container );
		await editor.getPreviewFrame().waitForSelector( '.elementor-tabs-content-wrapper .e-con.elementor-active' );

		// Act.
		await page.locator( '.elementor-control-section_tabs_responsive' ).click();
		await page.selectOption( '.elementor-control-breakpoint_selector >> select', { value: 'tablet' } );

		const desktopTabWrapper = editor.getPreviewFrame().locator( '.elementor-tabs-wrapper' ),
			mobileTabActive = editor.getPreviewFrame().locator( '.elementor-tab-mobile-title.elementor-active' );

		// Assert.
		// Check if the correct tabs are displayed on tablet view.
		await editor.changeResponsiveView( 'tablet' );
		expect( desktopTabWrapper ).toBeVisible();
		expect( mobileTabActive ).not.toBeVisible();
		// Check if the correct tabs are displayed on mobile view.
		await editor.changeResponsiveView( 'mobile' );
		expect( desktopTabWrapper ).not.toBeVisible();
		expect( mobileTabActive ).toBeVisible();

		await wpAdmin.setExperiments( {
			container: false,
			'nested-elements': false,
		} );
	} );
} );
