import { test, expect } from '@playwright/test';
import WpAdminPage from '../pages/wp-admin-page';

// Skipped until building packages as part of the root build process.
test.describe.skip( 'Editor v2', () => {
	const updateExperiment = async ( { browser, testInfo }, experimentState ) => {
		const context = await browser.newContext();
		const page = await context.newPage();

		const wpAdminPage = new WpAdminPage( page, testInfo );

		await wpAdminPage.setExperiments( { editor_v2: experimentState } );

		await page.close();
		await context.close();
	};

	test.beforeAll( async ( { browser }, testInfo ) => {
		// Make sure the experiment of editor v2 is enabled during all the tests.
		await updateExperiment( { browser, testInfo }, true );
	} );

	test.afterAll( async ( { browser }, testInfo ) => {
		// Disable the experiment of editor v2 after all the tests.
		await updateExperiment( { browser, testInfo }, false );
	} );

	test( 'validate the top bar appears', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );

		// Act.
		const editor = await wpAdmin.useElementorCleanPost();

		// Assert
		const wrapper = editor.page.locator( '#elementor-editor-v2-top-bar' );

		expect( await wrapper.screenshot( {
			type: 'jpeg',
			quality: 70,
		} ) ).toMatchSnapshot( 'editor-v2-wrapper.jpg' );
	} );
} );
