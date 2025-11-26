import { BrowserContext, Page, expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { INLINE_EDITING_SELECTORS } from './selectors/selectors';

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
		const inlineEditor = page.locator( INLINE_EDITING_SELECTORS.canvasInlineEditor );

		await expect( inlineEditor ).toBeVisible();
		await inlineEditor.clear();
		await page.keyboard.press( 'ControlOrMeta+U' );
		await page.keyboard.type( 'this' );
		await page.keyboard.press( 'ControlOrMeta+U' );
		await page.keyboard.type( ' is the first test' );

		// Assert
		await expect( headingElement ).toContainText( NEW_TITLE );

		const panelInlineEditor = page.getByLabel( INLINE_EDITING_SELECTORS.contentSectionLabel ).locator( INLINE_EDITING_SELECTORS.panelInlineEditor );
		const panelHTML = await panelInlineEditor.innerHTML();

		expect( panelHTML ).toContain( '<u>this</u>' );

		await editor.publishAndViewPage();
		const publishedHeading = page.locator( INLINE_EDITING_SELECTORS.headingBase ).last();

		await expect( publishedHeading ).toContainText( NEW_TITLE );

		const underlinedText = publishedHeading.locator( 'u' );

		await expect( underlinedText ).toBeVisible();

		await expect( underlinedText ).toContainText( 'this' );
	} );

	test( 'Delete entire content and enter new text without errors', async () => {
		const INITIAL_CONTENT = 'Initial heading text';
		const NEW_CONTENT = 'Brand new heading';

		// Arrange
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		const headingId = await editor.addWidget( { widgetType: 'e-heading', container: containerId } );
		const previewFrame = editor.getPreviewFrame();
		const headingElement = previewFrame.locator( `.elementor-element-${ headingId }` );

		await expect( headingElement ).toBeVisible();

		await headingElement.click();
		const inlineEditor = page.locator( INLINE_EDITING_SELECTORS.canvasInlineEditor );

		await expect( inlineEditor ).toBeVisible();

		// Act 
		await page.keyboard.press( 'ControlOrMeta+A' );
		await page.keyboard.type( INITIAL_CONTENT );

		// Assert 
		await expect( headingElement ).toContainText( INITIAL_CONTENT );
		await expect( headingElement ).toBeVisible();

		// Act 
		await page.keyboard.press( 'ControlOrMeta+A' );
		await page.keyboard.press( 'Delete' );
		await page.keyboard.type( NEW_CONTENT );

		// Assert 
		await expect( headingElement ).toContainText( NEW_CONTENT );
		await expect( headingElement ).toBeVisible();

		const panelInlineEditor = page.getByLabel( INLINE_EDITING_SELECTORS.contentSectionLabel ).locator( INLINE_EDITING_SELECTORS.panelInlineEditor );
		const panelHTML = await panelInlineEditor.innerHTML();

		expect( panelHTML ).toContain( NEW_CONTENT );
	} );
} );
