const base = require( '@playwright/test' );
const WpAdminPage = require( './pages/wp-admin-page' );
const EditorPage = require( './pages/editor-page' );

module.exports = base.test.extend( {
	wpAdminPage: async ( { page }, use ) => {
		await use( new WpAdminPage( page ) );
	},
	editorPage: async ( { wpAdminPage }, use ) => {
		const pageId = await wpAdminPage.createElementorPage();

		const editorPage = new EditorPage( wpAdminPage.page );
		await editorPage.ensureLoaded();
		await editorPage.ensureNavigatorClosed();
		await editorPage.ensureNoticeBarClosed();

		await use( editorPage );

		await wpAdminPage.moveElementorPageToTrash( pageId );
		await wpAdminPage.deletePermenantlyElementorPageFromTrash( pageId );
	},
} );
