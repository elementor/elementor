const { test, expect } = require( '@playwright/test' );
const { createPage, deletePage } = require( '../../../utilities/rest-api' );
const WpAdminPage = require( '../../../pages/wp-admin-page' );
const { setup } = require( './helper' );

test.describe( 'Nested Tabs tests @nested-tabs', () => {
	let pageId;

	test.beforeEach( async () => {
		pageId = await createPage();
	} );

	test.afterEach( async () => {
		await deletePage( pageId );
	} );

	test( 'General test', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin, { 'nested-elements-html': 'active' } );
		const editor = await wpAdmin.useElementorCleanPost(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		const widgetId = await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs-content .e-con.e-active' );

		// Tests.
		await expect( await editor.getPreviewFrame().locator( `.elementor-element-${ widgetId }` ) ).toHaveClass( /elementor-widget-n-tabs/ );
	} );
} );
