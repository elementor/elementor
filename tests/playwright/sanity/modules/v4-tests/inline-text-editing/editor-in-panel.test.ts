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
		await wpAdminPage.setExperiments( { 'v4-inline-text-editing': 'active' } );

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
} );
