import { BrowserContext, Page, expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { INLINE_EDITING_SELECTORS } from './selectors/selectors';

const TEST_URL = 'https://elementor.com';
const UPDATED_URL = 'https://google.com';
const TEST_TEXT = 'Click here';
const MULTI_WORD_TEXT = 'Hello World Today';

test.describe( 'Inline Editing Link @v4-tests', () => {
	let wpAdminPage: WpAdminPage;
	let context: BrowserContext;
	let page: Page;
	let editor: EditorPage;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		page = await context.newPage();
		wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdminPage.setExperiments( { e_atomic_elements: 'active' } );

		editor = await wpAdminPage.openNewPage();
	} );

	test.afterAll( async () => {
		await wpAdminPage?.resetExperiments();
		await context.close();
	} );

	test( 'Add link with target="_blank" via inline editor and verify on frontend', async () => {
		// Arrange.
		editor = await wpAdminPage.openNewPage();

		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		const headingId = await editor.addWidget( { widgetType: 'e-heading', container: containerId } );
		const headingElement = editor.previewFrame.locator( `.elementor-element-${ headingId }` );

		await expect( headingElement ).toBeVisible();

		// Act - Open inline editor and type text.
		await headingElement.dblclick();
		const inlineEditor = editor.previewFrame.locator( INLINE_EDITING_SELECTORS.canvas.inlineEditor );

		await expect( inlineEditor ).toBeVisible();
		await inlineEditor.clear();
		await page.keyboard.type( TEST_TEXT );

		// Act - Select text and add link with target="_blank".
		await page.keyboard.press( 'ControlOrMeta+A' );
		const linkButton = page.locator( '[role="presentation"] [aria-label="Link"]' );
		await linkButton.click();

		const urlInput = page.locator( 'input[placeholder="Type a URL"]' );
		await expect( urlInput ).toBeVisible();
		await urlInput.fill( TEST_URL );

		const newTabButton = page.locator( '[aria-label="Open in a new tab"]' );
		await newTabButton.click();
		await page.keyboard.press( 'Escape' );
		await inlineEditor.press( 'Escape' );

		// Assert - Verify link with target="_blank" in editor.
		const editorLink = headingElement.locator( 'a' );
		await expect( editorLink ).toHaveAttribute( 'href', TEST_URL );
		await expect( editorLink ).toHaveAttribute( 'target', '_blank' );

		// Act - Publish and view page.
		await editor.publishAndViewPage();

		// Assert - Verify link with target="_blank" on frontend.
		const publishedHeading = page.locator( INLINE_EDITING_SELECTORS.headingBase ).last();
		await expect( publishedHeading ).toBeVisible();

		const frontendLink = publishedHeading.locator( 'a' );
		await expect( frontendLink ).toBeVisible();
		await expect( frontendLink ).toHaveAttribute( 'href', TEST_URL );
		await expect( frontendLink ).toHaveAttribute( 'target', '_blank' );
		await expect( frontendLink ).toContainText( TEST_TEXT );
	} );

	test( 'Remove link by clearing URL', async () => {
		// Arrange.
		editor = await wpAdminPage.openNewPage();

		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		const headingId = await editor.addWidget( { widgetType: 'e-heading', container: containerId } );
		const headingElement = editor.previewFrame.locator( `.elementor-element-${ headingId }` );

		await expect( headingElement ).toBeVisible();
		await headingElement.dblclick();

		const inlineEditor = editor.previewFrame.locator( INLINE_EDITING_SELECTORS.canvas.inlineEditor );
		await expect( inlineEditor ).toBeVisible();
		await inlineEditor.clear();
		await page.keyboard.type( TEST_TEXT );

		// Act - Add link first.
		await page.keyboard.press( 'ControlOrMeta+A' );
		const linkButton = page.locator( '[aria-label="Link"]' );
		await linkButton.click();

		const urlInput = page.locator( 'input[placeholder="Type a URL"]' );
		await urlInput.fill( TEST_URL );
		await page.keyboard.press( 'Escape' );
		await inlineEditor.press( 'Escape' );

		// Assert - Verify link exists.
		await expect( headingElement.locator( 'a' ) ).toHaveAttribute( 'href', TEST_URL );

		// Act - Remove link by clearing URL.
		await headingElement.dblclick();
		await page.keyboard.press( 'ControlOrMeta+A' );
		await linkButton.click();
		await urlInput.clear();
		await page.keyboard.press( 'Escape' );
		await inlineEditor.press( 'Escape' );

		// Assert - Verify link is removed.
		await expect( headingElement.locator( 'a' ) ).toHaveCount( 0 );
	} );

	test( 'Edit existing link URL', async () => {
		// Arrange.
		editor = await wpAdminPage.openNewPage();

		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		const headingId = await editor.addWidget( { widgetType: 'e-heading', container: containerId } );
		const headingElement = editor.previewFrame.locator( `.elementor-element-${ headingId }` );

		await expect( headingElement ).toBeVisible();
		await headingElement.dblclick();

		const inlineEditor = editor.previewFrame.locator( INLINE_EDITING_SELECTORS.canvas.inlineEditor );
		await expect( inlineEditor ).toBeVisible();
		await inlineEditor.clear();
		await page.keyboard.type( TEST_TEXT );

		// Act - Add initial link.
		await page.keyboard.press( 'ControlOrMeta+A' );
		const linkButton = page.locator( '[aria-label="Link"]' );
		await linkButton.click();

		const urlInput = page.locator( 'input[placeholder="Type a URL"]' );
		await urlInput.fill( TEST_URL );
		await page.keyboard.press( 'Escape' );
		await inlineEditor.press( 'Escape' );

		// Assert - Verify initial link.
		await expect( headingElement.locator( 'a' ) ).toHaveAttribute( 'href', TEST_URL );

		// Act - Edit link URL.
		await headingElement.dblclick();
		await page.keyboard.press( 'ControlOrMeta+A' );
		await linkButton.click();
		await urlInput.clear();
		await urlInput.fill( UPDATED_URL );
		await page.keyboard.press( 'Escape' );
		await inlineEditor.press( 'Escape' );

		// Assert - Verify updated link.
		await expect( headingElement.locator( 'a' ) ).toHaveAttribute( 'href', UPDATED_URL );
	} );

	test( 'Add link to partial text selection', async () => {
		// Arrange.
		editor = await wpAdminPage.openNewPage();

		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		const headingId = await editor.addWidget( { widgetType: 'e-heading', container: containerId } );
		const headingElement = editor.previewFrame.locator( `.elementor-element-${ headingId }` );

		await expect( headingElement ).toBeVisible();
		await headingElement.dblclick();

		const inlineEditor = editor.previewFrame.locator( INLINE_EDITING_SELECTORS.canvas.inlineEditor );

		await expect( inlineEditor ).toBeVisible();
		await inlineEditor.clear();
		await page.keyboard.type( MULTI_WORD_TEXT );

		// Act - Select only "World" (double-click to select word).
		for ( let i = 0; i < 6; i++ ) {
			await page.keyboard.press( 'ArrowLeft', { delay: 100 } );
		}

		for ( let i = 0; i < 5; i++ ) {
			await page.keyboard.press( 'Shift+ArrowLeft', { delay: 100 } );
		}

		const linkButton = page.locator( '[role="presentation"] [aria-label="Link"]' );
		await linkButton.click();

		const urlInput = page.locator( 'input[placeholder="Type a URL"]' );
		await urlInput.fill( TEST_URL );
		await page.keyboard.press( 'Escape' );
		await inlineEditor.press( 'Escape' );

		// Assert - Verify only "World" is linked.
		const link = headingElement.locator( 'a' );
		await expect( link ).toHaveAttribute( 'href', TEST_URL );
		await expect( link ).toContainText( 'World' );
		await expect( link ).not.toContainText( 'Hello' );
	} );
} );

