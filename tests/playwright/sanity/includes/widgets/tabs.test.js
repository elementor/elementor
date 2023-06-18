const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../pages/wp-admin-page.js' );
const { setExperiment } = require( '../../../utilities/rest-api.js' );

test.describe( 'Tabs tests', () => {
	test.beforeAll( async () => {
		await setExperiment( 'container', true );
		await setExperiment( 'nested-elements', true );
	} );

	test.afterAll( async () => {
		await setExperiment( 'container', false );
		await setExperiment( 'nested-elements', false );
	} );

	test( 'Ensure the old tabs widget is telling deprecation warning message', async ( { page }, testInfo ) => {
	// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup();
		const editor = await wpAdmin.useElementorCleanPost();

		// Act.
		await editor.addWidget( 'tabs' );

		// Assert.
		await expect( editor.page.locator( '.elementor-control-raw-html.elementor-panel-alert.elementor-panel-alert-info' ) )
			.toContainText( 'You are currently editing a Tabs Widget in its old version.' );

		await cleanup();
	} );
} );
