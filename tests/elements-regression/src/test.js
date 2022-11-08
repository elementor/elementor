const base = require( '@playwright/test' );
const WpAdminPage = require( './pages/wp-admin-page' );
const EditorPage = require( './pages/editor-page' );
const FrontendPage = require( './pages/frontend-page' );

module.exports = base.test.extend( {
	wpAdminPage: async ( { page }, use ) => {
		await use( new WpAdminPage( page ) );

		await page.close();
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
	frontendPage: async ( { editorPage, context }, use ) => {
		const page = await context.newPage();
		const frontendPage = new FrontendPage( page );
		await frontendPage.goto( await editorPage.getId() );

		await use( frontendPage );

		await page.close();
	},
} );
