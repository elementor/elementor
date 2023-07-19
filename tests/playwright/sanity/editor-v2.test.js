const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../pages/wp-admin-page.js' );

test.describe( 'Editor v2', () => {
	let editor;
	let wpAdminPage;
	let context;

	test.beforeAll( async ( { browser }, testInfo ) => {
		context = await browser.newContext();

		const page = await context.newPage();

		wpAdminPage = new WpAdminPage( page, testInfo );

		await wpAdminPage.setExperiments( { editor_v2: true } );

		editor = await wpAdminPage.openNewPage();
	} );

	test.afterAll( async () => {
		await wpAdminPage.setExperiments( { editor_v2: false } );
	} );

	test( 'check that app-bar exists', async () => {
		// Act
		const wrapper = await editor.page.locator( '#elementor-editor-wrapper-v2' );

		await wrapper.getByRole( 'button', { name: 'Post Settings' } ).click();

		await editor.page.getByLabel( 'Title', { exact: true } ).fill( 'Test page' );

		await wrapper.getByRole( 'button', { name: 'Test page' } ).waitFor();

		// Assert
		await expect( await wrapper.screenshot( {
			type: 'jpeg',
			quality: 70,
		} ) ).toMatchSnapshot( 'editor-v2-wrapper.jpg', { maxDiffPixels: 100 } );
	} );
} );
