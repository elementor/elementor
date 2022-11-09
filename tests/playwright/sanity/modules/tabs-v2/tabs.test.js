const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../pages/wp-admin-page' );

test.describe( 'Nested Tabs tests', () => {
	test( 'Test position of Title Typography control', async ( { page }, testInfo ) => {
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

		// Act.
		await editor.activatePanelTab( 'style' );
		await page.locator( '.elementor-control-section_title_style' ).click();
		await page.locator( '.elementor-control-title_style .elementor-control-title_hover' ).click();

		// Assert.
		// Check if the typography control is still visible after selecting the hover style controls.
		expect( page.locator( '.elementor-control-title_typography_typography' ) ).toBeVisible();

		await wpAdmin.setExperiments( {
			container: false,
			'nested-elements': false,
		} );
	} );

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
		await editor.addWidget( 'tabs-v2', container );

		// Act.
		const addSectionIconCountTabs = await editor.getPreviewFrame().locator( '.elementor-tabs-content-wrapper .e-con.elementor-active .elementor-add-new-section i' ).count(),
			addSectionIconCountMainContainer = await editor.getPreviewFrame().locator( '#elementor-add-new-section .elementor-add-new-section i' ).count();

		// Assert.
		// Check if the tabs has 1 icon in the Add Section element and the main container 2 icons.
		expect( addSectionIconCountTabs ).toBe( 1 );
		expect( addSectionIconCountMainContainer ).toBe( 2 );

		await wpAdmin.setExperiments( {
			container: false,
			'nested-elements': false,
		} );
	} );
} );
