const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../pages/wp-admin-page' );
const { ExperimentsAPI } = require( '../../../API/experiments-api' );

const nestedElementsExperiment = 'nested-elements';
const containerExperiment = 'container';

test.beforeAll( async ( { browser } ) => {
	const page = await ( await browser.newContext() ).newPage();
	const experimentsAPI = new ExperimentsAPI( page );
	await experimentsAPI.activateExperiments( [ nestedElementsExperiment, containerExperiment ] );
} );

test.afterAll( async ( { browser } ) => {
	const page = await ( await browser.newContext() ).newPage();
	const experimentsAPI = new ExperimentsAPI( page );
	await experimentsAPI.deactivateExperiments( [ nestedElementsExperiment, containerExperiment ] );
} );

test.describe( 'Nested Tabs tests', () => {
	test( 'Count the number of icons inside the Add Section element', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
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
	} );

	test( 'Title alignment setting', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
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
	} );
} );
