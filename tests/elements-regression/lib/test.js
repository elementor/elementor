const { test } = require( '@playwright/test' );
const WPAdminPage = require( './pages/wp-admin-page' );
const EditorPage = require( './pages/editor-page' );

module.exports = test.extend( {
	wpAdminPage: async ( { page }, use ) => {
		use( new WPAdminPage( page ) );
	},
	editorPage: async ( { wpAdminPage }, use ) => {
		// Setup
		const pageId = await wpAdminPage.createElementorPage();

		const editorPage = new EditorPage( wpAdminPage.page, pageId );
		await editorPage.ensureLoaded();

		// Test run
		await use( editorPage );

		// Teardown
		await wpAdminPage.moveElementorPageToTrash( pageId );
		await wpAdminPage.deletePermenantlyElementorPageFromTrash( pageId );
	},
} );
