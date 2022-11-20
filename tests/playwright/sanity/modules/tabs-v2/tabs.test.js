const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../pages/wp-admin-page' );
const { ExperimentsAPI } = require( '../../../API/experiments-api' );

test.beforeAll( async ( {}, testInfo ) => {
	const experimentsAPI = new ExperimentsAPI( testInfo );
	await experimentsAPI.activateExperiments( [ 'nested-elements', 'container' ] );
} );

test.afterAll( async ( {}, testInfo ) => {
	const experimentsAPI = new ExperimentsAPI( testInfo );
	await experimentsAPI.deactivateExperiments( [ 'nested-elements', 'container' ] );
} );

test.describe( 'Nested Tabs tests', () => {
	test( 'Count the number of icons inside the Add Section element', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = await wpAdmin.useElementorCleanPost(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( 'tabs-v2', container );
		await editor.getPreviewFrame().waitForSelector( '.elementor-tabs-content-wrapper .e-con.elementor-active' );

		// Act.
		const iconCountForTabs = await editor.getPreviewFrame().locator( '.elementor-tabs-content-wrapper .e-con.elementor-active .elementor-add-new-section i' ).count(),
			iconCountForMainContainer = await editor.getPreviewFrame().locator( '#elementor-add-new-section .elementor-add-new-section i' ).count();

		// Assert.
		// Check if the tabs has 1 icon in the Add Section element and the main container 2 icons.
		expect( iconCountForTabs ).toBe( 1 );
		expect( iconCountForMainContainer ).toBe( 2 );
	} );

	test( 'Title alignment setting', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );

		const editor = await wpAdmin.useElementorCleanPost(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( 'tabs-v2', container );
		await editor.getPreviewFrame().waitForSelector( '.elementor-tabs-content-wrapper .e-con.elementor-active' );

		// Act.
		// Set tabs direction to 'stretch'.
		await page.locator( '.elementor-control-tabs_justify_horizontal .elementor-control-input-wrapper .eicon-h-align-stretch' ).click();
		// Set align title to 'start'.
		await page.locator( '.elementor-control-title_alignment .elementor-control-input-wrapper .eicon-text-align-left' ).click();

		// Assert.
		// Check if titles are aligned on the left.
		await expect( editor.getPreviewFrame().locator( '.elementor-widget-tabs-v2 .elementor-tabs-wrapper .elementor-tab-title.elementor-active' ) ).toHaveCSS( 'justify-content', 'flex-start' );
	} );
} );
