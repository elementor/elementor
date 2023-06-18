const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../pages/wp-admin-page.js' );
const { setExperiment } = require( '../utilities/rest-api' );

// Skipped until building packages as part of the root build process.
test.describe.skip( 'Editor v2', () => {
	test.beforeAll( async () => {
		// Make sure the experiment of editor v2 is enabled during all the tests.
		await setExperiment( 'editor_v2', true );
	} );

	test.afterAll( async () => {
		// Disable the experiment of editor v2 after all the tests.
		await setExperiment( 'editor_v2', false );
	} );

	test( 'validate the top bar appears', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );

		// Act.
		const editor = await wpAdmin.useElementorCleanPost();

		// Assert
		const wrapper = await editor.page.locator( '#elementor-editor-v2-top-bar' );

		await expect( await wrapper.screenshot( {
			type: 'jpeg',
			quality: 70,
		} ) ).toMatchSnapshot( 'editor-v2-wrapper.jpg' );
	} );
} );
