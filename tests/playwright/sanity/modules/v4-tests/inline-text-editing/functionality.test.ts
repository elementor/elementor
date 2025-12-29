import { BrowserContext, Page, expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { INLINE_EDITING_SELECTORS } from './selectors/selectors';

test.describe( 'Inline Editing Control @v4-tests', () => {
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

	test( 'Paragraph control panel screenshot', async () => {
		await test.step( 'Add paragraph widget and capture control panel', async () => {
			const containerId = await editor.addElement( { elType: 'container' }, 'document' );
			await editor.addWidget( { widgetType: INLINE_EDITING_SELECTORS.e_paragraph, container: containerId } );

			await expect.soft( page.getByLabel( INLINE_EDITING_SELECTORS.contentSection ) ).toHaveScreenshot( 'paragraph-control-panel.png' );
		} );
	} );

	test( 'Edit paragraph with formatting', async () => {
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		const paragraphId = await editor.addWidget( { widgetType: INLINE_EDITING_SELECTORS.e_paragraph, container: containerId } );
		await editor.closeNavigatorIfOpen();

		await test.step( 'Edit paragraph text with inline editing', async () => {
			const paragraphElement = editor.previewFrame.locator( `.elementor-element-${ paragraphId } .e-paragraph-base` );
			await paragraphElement.dblclick();
			const textarea = editor.previewFrame.locator( INLINE_EDITING_SELECTORS.canvasInlineEditor );

			await expect( textarea ).toBeVisible();
			await textarea.fill( 'a' );
			await page.keyboard.press( 'ControlOrMeta+A' );
			await page.keyboard.press( 'Backspace' );

			await page.keyboard.type( INLINE_EDITING_SELECTORS.paragraphPrefix );

			await page.keyboard.press( 'ControlOrMeta+B' );
			await page.keyboard.type( INLINE_EDITING_SELECTORS.boldText );
			await page.keyboard.press( 'ControlOrMeta+B' );

			await page.keyboard.type( INLINE_EDITING_SELECTORS.textBetween );

			await page.keyboard.press( 'ControlOrMeta+U' );
			await page.keyboard.type( INLINE_EDITING_SELECTORS.underlineText );
			await page.keyboard.press( 'ControlOrMeta+U' );

			await page.keyboard.type( INLINE_EDITING_SELECTORS.paragraphSuffix );
			await page.keyboard.press( 'Enter' );
			await page.keyboard.type( INLINE_EDITING_SELECTORS.secondLine );

			await expect.soft( paragraphElement ).toHaveScreenshot( 'inline-edited-paragraph-editor.png' );
		} );

		await test.step( 'Edited control panel display', async () => {
			const contentSection = page.getByLabel( INLINE_EDITING_SELECTORS.contentSection );

			await editor.selectElement( containerId );
			await editor.selectElement( paragraphId );
			await expect.soft( contentSection ).toHaveScreenshot( 'inline-edited-paragraph-control-panel.png' );
		} );

		await test.step( 'Publish and verify content', async () => {
			await editor.publishAndViewPage();

			const publishedParagraph = page.locator( '.e-paragraph-base' ).last();

			await expect.soft( publishedParagraph ).toHaveScreenshot( 'inline-edited-paragraph-frontend.png' );
		} );
	} );
} );
