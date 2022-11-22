const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../pages/wp-admin-page.js' );
const { ExperimentsAPI } = require( '../../../API/experiments-api' );

const nestedElementsExperiment = 'nested-elements';
const containerExperiment = 'container';

test.beforeAll( async ( { request, browser }, testInfo ) => {
	const page = await ( await browser.newContext() ).newPage();
	const experimentsAPI = new ExperimentsAPI( request, testInfo, page );
	await experimentsAPI.activateExperiments( [ nestedElementsExperiment, containerExperiment ] );
 } );

// Test.afterAll( async ( { request }, testInfo ) => {
// 	const experimentsAPI = new ExperimentsAPI( request, testInfo );
// 	await experimentsAPI.deactivateExperiments( [ nestedElementsExperiment, containerExperiment ] );
// } );

test.only( 'Ensure the old tabs widget is telling deprecation warning message', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo );
	const editor = await wpAdmin.useElementorCleanPost();

	// Act.
	await editor.addWidget( 'tabs' );

	// Assert.
	await expect( editor.page.locator( '.elementor-control-raw-html.elementor-panel-alert.elementor-panel-alert-info' ) )
		.toContainText( 'You are currently editing a Tabs Widget in its old version.' );
} );

