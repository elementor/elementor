import { BrowserContext, Page, expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';

const CANVAS_INLINE_EDITOR_SELECTOR = '#elementor-preview-responsive-wrapper [contenteditable="true"][class*="ProseMirror"]';
const PANEL_INLINE_EDITOR_SELECTOR = '.tiptap';
const CONTENT_SECTION_LABEL = 'Content';

test.describe( 'Inline Editing Canvas @v4-tests', () => {
	let wpAdminPage: WpAdminPage;
	let context: BrowserContext;
	let page: Page;
	let editor: EditorPage;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		page = await context.newPage();
		wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdminPage.setExperiments( { e_atomic_elements: 'active' } );
		await wpAdminPage.setExperiments( { 'v4-inline-text-editing': 'active' } );

		editor = await wpAdminPage.openNewPage();
	} );

	test.afterAll( async () => {
		await wpAdminPage?.resetExperiments();
		await context.close();
	} );

	test( 'Edit the heading-title from the canvas and check the value in the panel and in the front', async () => {
		const NEW_TITLE = 'this is the first test';

		// Arrange
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		const headingId = await editor.addWidget( { widgetType: 'e-heading', container: containerId } );
		const previewFrame = editor.getPreviewFrame();
		const headingElement = previewFrame.locator( `.elementor-element-${ headingId }` );
		await expect( headingElement ).toBeVisible();

		// Act
		await headingElement.click();
		const inlineEditor = page.locator( CANVAS_INLINE_EDITOR_SELECTOR );
		await expect( inlineEditor ).toBeVisible();
		await inlineEditor.clear();
		await page.keyboard.press( 'ControlOrMeta+U' );
		await page.keyboard.type( 'this' );
		await page.keyboard.press( 'ControlOrMeta+U' );
		await page.keyboard.type( ' is the first test' );

		// Assert
		await expect( headingElement ).toContainText( NEW_TITLE );

		const panelInlineEditor = page.getByLabel( CONTENT_SECTION_LABEL ).locator( PANEL_INLINE_EDITOR_SELECTOR );
		const panelHTML = await panelInlineEditor.innerHTML();
		expect( panelHTML ).toContain( '<u>this</u>' );

		await editor.publishAndViewPage();
		const publishedHeading = page.locator( '.e-heading-base' ).last();
		await expect( publishedHeading ).toContainText( NEW_TITLE );

		const underlinedText = publishedHeading.locator( 'u' );
		await expect( underlinedText ).toBeVisible();
		await expect( underlinedText ).toContainText( 'this' );
	} );
} );
