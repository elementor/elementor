import { BrowserContext, Page, expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { INLINE_EDITING_SELECTORS } from './selectors/selectors';

test.describe( 'Inline Editing Control in Editor Panel @v4-tests', () => {
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

	test( 'Panel inline editor maintains focus when typing letter by letter', async () => {
		const TEST_WORD = 'Focus';

		// Arrange
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		const headingId = await editor.addWidget( { widgetType: 'e-heading', container: containerId } );

		await editor.selectElement( headingId );

		const contentSection = page.getByLabel( INLINE_EDITING_SELECTORS.panel.contentSection );
		const panelInlineEditor = contentSection.locator( INLINE_EDITING_SELECTORS.panel.inlineEditor );

		await expect( panelInlineEditor ).toBeVisible();
		await panelInlineEditor.clear();

		// Act & Assert
		for ( const letter of TEST_WORD ) {
			await page.keyboard.type( letter );
			// Wait for the letter to be typed and the focus to be maintained after value change propagation.
			await page.waitForTimeout( 250 );

			await expect( panelInlineEditor ).toBeFocused();
		}

		await expect( panelInlineEditor ).toHaveText( TEST_WORD );
	} );

	test.only( 'Panel inline editor toolbar applies formatting to text and canvas', async () => {
		const FORMATTED_WORD = INLINE_EDITING_SELECTORS.attributes.bold;
		const PLAIN_PREFIX = 'plain ';
		const PLAIN_SUFFIX = ' plain';

		// Arrange
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		const paragraphId = await editor.addWidget( {
			widgetType: INLINE_EDITING_SELECTORS.e_paragraph,
			container: containerId,
		} );

		await editor.selectElement( paragraphId );

		const contentSection = editor.getPanelContentSection();
		const panelInlineEditor = editor.getPanelInlineEditor();
		const canvasParagraph = editor.previewFrame.locator(
			`.elementor-element-${ paragraphId } ${ INLINE_EDITING_SELECTORS.atomsBaseClass.paragraph }`,
		);

		await expect( panelInlineEditor ).toBeVisible();
		await expect( contentSection.getByRole( 'button', { name: INLINE_EDITING_SELECTORS.formatButtonLabels.bold } ) ).toBeVisible();

		await panelInlineEditor.click();
		await panelInlineEditor.clear();

		await test.step( 'Apply bold while typing using the panel toolbar', async () => {
			await page.keyboard.type( PLAIN_PREFIX );
			await editor.togglePanelInlineEditingAttribute( INLINE_EDITING_SELECTORS.attributes.bold );
			await page.keyboard.type( FORMATTED_WORD );
			await editor.togglePanelInlineEditingAttribute( INLINE_EDITING_SELECTORS.attributes.bold );
			await page.keyboard.type( PLAIN_SUFFIX );
		} );

		const SELECTION_FORMATS = [
			{ attribute: INLINE_EDITING_SELECTORS.attributes.underline, label: 'underline' },
			{ attribute: INLINE_EDITING_SELECTORS.attributes.italic, label: 'italic' },
			{ attribute: INLINE_EDITING_SELECTORS.attributes.strikethrough, label: 'strikethrough' },
			{ attribute: INLINE_EDITING_SELECTORS.attributes.code, label: 'code' },
		] as const;

		await page.pause();
		for ( const { attribute, label } of SELECTION_FORMATS ) {
			await test.step( `Apply ${ label } to selected text using the panel toolbar`, async () => {
				await editor.selectPanelInlineEditedText( FORMATTED_WORD );
				await editor.togglePanelInlineEditingAttribute( attribute );
			} );
		}

		await test.step( 'Verify formatting in the panel and on the canvas', async () => {
			await expect( panelInlineEditor.locator( 'strong' ) ).toContainText( FORMATTED_WORD );
			await expect( panelInlineEditor.locator( 'u' ) ).toContainText( FORMATTED_WORD );

			await expect( canvasParagraph.locator( 'strong' ) ).toContainText( FORMATTED_WORD );
			await expect( canvasParagraph.locator( 'u' ) ).toContainText( FORMATTED_WORD );
		} );
	} );
} );
