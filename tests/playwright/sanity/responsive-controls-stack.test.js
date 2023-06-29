const { test, expect } = require( '@playwright/test' );
const { createPage, deletePage } = require( '../utilities/rest-api' );
const WpAdminPage = require( '../pages/wp-admin-page.js' );
const EditorPage = require( '../pages/editor-page' );

test.describe( 'Responsive Controls Stack', () => {
	let pageId;

	test.beforeAll( async ( { browser }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			editor_v2: false,
			additional_custom_breakpoints: true,
		} );
	} );

	test.beforeEach( async () => {
		pageId = await createPage();
	} );

	// Test.afterEach( async () => {
	// 	await deletePage( pageId );
	// } );

	test( 'Template widget responsive controls', async ( { context, page }, testInfo ) => {
		// This test is checking that the CSS is updated when changing the responsive controls.
		// In case of Additional breakpoints enabled, it's

		const editorPage = new EditorPage( page, testInfo );
		const templatePath = `../templates/responsive-controls-stack.json`;
		await editorPage.gotoPostId( pageId );
		await editorPage.loadTemplate( templatePath );

		const previewPage = await editorPage.previewChanges( context );

		// Open page
	},
	);
} );

