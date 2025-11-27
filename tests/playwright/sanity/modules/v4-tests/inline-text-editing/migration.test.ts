import { BrowserContext, Page, expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';

test.describe( 'Inline Text Editing Migration @v4-tests', () => {
	let wpAdminPage: WpAdminPage;
	let context: BrowserContext;
	let page: Page;
	let editor: EditorPage;
	let postId: number;
	const customTitle = 'My Custom Heading Title';

	test.only( 'Content persists when toggling inline text editing experiment', async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		page = await context.newPage();
		wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );

		await test.step( 'Create page with heading widget without inline editing experiment', async () => {
			await wpAdminPage.setExperiments( {
				e_atomic_elements: 'active',
				'v4-inline-text-editing': 'inactive',
			} );

			editor = await wpAdminPage.openNewPage();
			const containerId = await editor.addElement( { elType: 'container' }, 'document' );
			const headingId = await editor.addWidget( { widgetType: 'e-heading', container: containerId } );

			await editor.selectElement( headingId );
			await editor.setTextControlValue( 'title', customTitle );

			const previewFrame = editor.getPreviewFrame();
			const headingElement = previewFrame.locator( `.elementor-element-${ headingId } .e-heading-base` );
			await expect( headingElement ).toContainText( customTitle );

			await editor.publishPage();
			postId = editor.postId;
		} );

		await test.step( 'Verify content on frontend before experiment activation', async () => {
			await editor.viewPage();
			const headingOnFrontend = page.locator( '.e-heading-base' ).first();
			await expect( headingOnFrontend ).toContainText( customTitle );
		} );

		await test.step( 'Activate inline text editing experiment', async () => {
			await wpAdminPage.setExperiments( {
				'v4-inline-text-editing': 'active',
			} );
		} );

		await test.step( 'Verify content exists and is editable after experiment activation', async () => {
			await page.goto( `/wp-admin/post.php?post=${ postId }&action=elementor` );
			await wpAdminPage.waitForPanel();
			editor = new EditorPage( page, testInfo, postId );

			const previewFrame = editor.getPreviewFrame();
			const headingElement = previewFrame.locator( '.e-heading-base' ).first();

			await expect( headingElement ).toContainText( customTitle );

			await headingElement.click();
			const contentSection = page.getByLabel( 'Content section content' );
			await expect( contentSection ).toBeVisible();

			const textarea = contentSection.locator( '.tiptap' );
			await expect( textarea ).toBeVisible();
			await expect( textarea ).toHaveText( customTitle );

			const updatedTitle = `${ customTitle } - Updated`;
			await textarea.fill( updatedTitle );

			await expect( headingElement ).toContainText( updatedTitle );

			await editor.publishAndViewPage();
			const headingOnFrontend = page.locator( '.e-heading-base' ).first();
			await expect( headingOnFrontend ).toContainText( updatedTitle );
		} );

		await test.step( 'Deactivate inline text editing experiment', async () => {
			await wpAdminPage.setExperiments( {
				'v4-inline-text-editing': 'inactive',
			} );
		} );

		await test.step( 'Verify content exists and is editable after experiment deactivation', async () => {
			await page.goto( `/wp-admin/post.php?post=${ postId }&action=elementor` );
			await wpAdminPage.waitForPanel();
			editor = new EditorPage( page, testInfo, postId );

			const previewFrame = editor.getPreviewFrame();
			const headingElement = previewFrame.locator( '.e-heading-base' ).first();

			await expect( headingElement ).toContainText( `${ customTitle } - Updated` );

			const headingId = await headingElement.locator( '..' ).getAttribute( 'data-id' );
			await editor.selectElement( headingId );

			const titleControl = page.locator( '.elementor-control-title input' );
			await expect( titleControl ).toBeVisible();

			const finalTitle = `${ customTitle } - Final`;
			await editor.setTextControlValue( 'title', finalTitle );

			await expect( headingElement ).toContainText( finalTitle );

			await editor.publishAndViewPage();
			const headingOnFrontend = page.locator( '.e-heading-base' ).first();
			await expect( headingOnFrontend ).toContainText( finalTitle );
		} );

		await test.step( 'Cleanup', async () => {
			await wpAdminPage.resetExperiments();
			await context.close();
		} );
	} );
} );

