import { BrowserContext, Page, expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { INLINE_EDITING_SELECTORS } from './selectors/selectors';

test.describe( 'Inline Text Editing Migration @v4-tests', () => {
	let wpAdminPage: WpAdminPage;
	let context: BrowserContext;
	let page: Page;
	let editor: EditorPage;
	let postId: string;
	const customTitle = 'My Custom Heading Title';

	test( 'Content persists when toggling inline text editing experiment', async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		page = await context.newPage();
		wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );

		await test.step( 'Create page with heading widget without inline editing experiment', async () => {
			await wpAdminPage.setExperiments( { e_atomic_elements: true } );
			await wpAdminPage.setExperiments( { 'v4-inline-text-editing': false } );

			editor = await wpAdminPage.openNewPage();
			const containerId = await editor.addElement( { elType: 'container' }, 'document' );
			const headingId = await editor.addWidget( { widgetType: 'e-heading', container: containerId } );

			await editor.v4Panel.openTab( 'general' );
			await editor.v4Panel.fillTextarea( 0, customTitle );

			const previewFrame = editor.getPreviewFrame();
			const headingElement = previewFrame.locator( `.elementor-element-${ headingId } .e-heading-base` );
			await expect( headingElement ).toContainText( customTitle );

			await editor.publishPage();
			postId = await editor.getPageId();
		} );

		await test.step( 'Verify content on frontend before experiment activation', async () => {
			await editor.viewPage();
			const headingOnFrontend = page.locator( INLINE_EDITING_SELECTORS.headingBase ).first();
			await expect( headingOnFrontend ).toContainText( customTitle );
		} );

		await test.step( 'Activate inline text editing experiment', async () => {
			await wpAdminPage.setExperiments( {
				'v4-inline-text-editing': true,
			} );
		} );

		await test.step( 'Verify content exists and is editable after experiment activation', async () => {
			await page.goto( `/wp-admin/post.php?post=${ postId }&action=elementor` );
			await wpAdminPage.waitForPanel();
			editor = new EditorPage( page, testInfo, Number( postId ) );

			const previewFrame = editor.getPreviewFrame();
			const headingElement = previewFrame.locator( INLINE_EDITING_SELECTORS.headingBase ).first();

			await expect( headingElement ).toContainText( customTitle );

			await headingElement.click();
			const contentSection = page.getByLabel( INLINE_EDITING_SELECTORS.contentSection );
			await expect( contentSection ).toBeVisible();

			const textarea = contentSection.locator( INLINE_EDITING_SELECTORS.panelInlineEditor );
			await expect( textarea ).toBeVisible();
			await expect( textarea ).toHaveText( customTitle );

			const updatedTitle = `${ customTitle } (Updated)`;
			await textarea.fill( updatedTitle );

			await expect( headingElement ).toContainText( updatedTitle );

			await editor.publishAndViewPage();
			const headingOnFrontend = page.locator( INLINE_EDITING_SELECTORS.headingBase ).first();
			const actualText = await headingOnFrontend.textContent();
			expect( actualText.trim() ).toContain( updatedTitle );
		} );

		await test.step( 'Deactivate inline text editing experiment', async () => {
			await wpAdminPage.setExperiments( {
				'v4-inline-text-editing': false,
			} );
		} );

		await test.step( 'Verify content exists and is editable after experiment deactivation', async () => {
			await page.goto( `/wp-admin/post.php?post=${ postId }&action=elementor` );
			await wpAdminPage.waitForPanel();
			editor = new EditorPage( page, testInfo, Number( postId ) );

			const previewFrame = editor.getPreviewFrame();
			const headingElement = previewFrame.locator( INLINE_EDITING_SELECTORS.headingBase ).first();

			await expect( headingElement ).toContainText( `${ customTitle } (Updated)` );

			const headingId = await headingElement.locator( '..' ).getAttribute( 'data-id' );
			await editor.selectElement( headingId );

			const finalTitle = `${ customTitle } (Final)`;
			await editor.v4Panel.openTab( 'general' );
			await editor.v4Panel.fillTextarea( 0, finalTitle );

			await expect( headingElement ).toContainText( finalTitle );

			await editor.publishAndViewPage();
			const headingOnFrontend = page.locator( INLINE_EDITING_SELECTORS.headingBase ).first();
			await expect( headingOnFrontend ).toContainText( finalTitle );
		} );

		await test.step( 'Cleanup', async () => {
			await wpAdminPage.resetExperiments();
			await context.close();
		} );
	} );
} );

