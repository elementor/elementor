import { BrowserContext, Page, expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { INLINE_EDITING_SELECTORS } from './selectors/selectors';
import EditorSelectors from '../../../../selectors/editor-selectors';

const NAVIGATOR_INLINE_CHILD = '.elementor-navigator__inline-child';
const NAVIGATOR_INLINE_CHILD_ICON = '.elementor-navigator__inline-child .eicon-atomic-label';

test.describe( 'Navigator Inline Children @v4-tests', () => {
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

	test( 'Should display inline children in the navigator when heading has formatted text', async () => {
		// Arrange
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		const headingId = await editor.addWidget( { widgetType: 'e-heading', container: containerId } );

		await editor.previewFrame.locator( `.elementor-element-${ headingId }` ).waitFor();

		const inlineEditor = await editor.triggerEditingElement( headingId );

		await expect( inlineEditor ).toBeVisible();
		await inlineEditor.clear();
		await page.keyboard.type( 'plain bold plain' );

		await editor.selectInlineEditedText( headingId, 'bold' );
		await editor.toggleInlineEditingAttribute( INLINE_EDITING_SELECTORS.attributes.bold );
		await page.keyboard.press( 'Escape' );

		// Act
		const navigatorElement = page.locator( EditorSelectors.panels.navigator.getElement( headingId ) );

		await navigatorElement.waitFor();

		// Assert
		const inlineChildren = navigatorElement.locator( NAVIGATOR_INLINE_CHILD );

		await expect( inlineChildren ).toHaveCount( 1 );

		const icons = navigatorElement.locator( NAVIGATOR_INLINE_CHILD_ICON );

		await expect( icons ).toHaveCount( 1 );
	} );

	test( 'Should display inline children for paragraph with multiple formatting types', async () => {
		// Arrange
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		const paragraphId = await editor.addWidget( { widgetType: 'e-paragraph', container: containerId } );

		await editor.previewFrame.locator( `.elementor-element-${ paragraphId }` ).waitFor();

		const inlineEditor = await editor.triggerEditingElement( paragraphId );

		await expect( inlineEditor ).toBeVisible();
		await inlineEditor.clear();
		await page.keyboard.type( 'normal bold italic underline strikethrough' );

		await editor.selectInlineEditedText( paragraphId, 'bold' );
		await editor.toggleInlineEditingAttribute( INLINE_EDITING_SELECTORS.attributes.bold );

		await editor.selectInlineEditedText( paragraphId, 'italic' );
		await editor.toggleInlineEditingAttribute( INLINE_EDITING_SELECTORS.attributes.italic );

		await editor.selectInlineEditedText( paragraphId, 'underline' );
		await editor.toggleInlineEditingAttribute( INLINE_EDITING_SELECTORS.attributes.underline );

		await editor.selectInlineEditedText( paragraphId, 'strikethrough' );
		await editor.toggleInlineEditingAttribute( INLINE_EDITING_SELECTORS.attributes.strikethrough );

		await page.keyboard.press( 'Escape' );

		// Act
		const navigatorElement = page.locator( EditorSelectors.panels.navigator.getElement( paragraphId ) );

		await navigatorElement.waitFor();

		// Assert
		const inlineChildren = navigatorElement.locator( NAVIGATOR_INLINE_CHILD );

		await expect( inlineChildren.first() ).toBeVisible();

		const icons = navigatorElement.locator( NAVIGATOR_INLINE_CHILD_ICON );

		expect( await icons.count() ).toEqual( await inlineChildren.count() );
	} );

	test( 'Should not display inline children for widget without formatted text', async () => {
		// Arrange
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		const headingId = await editor.addWidget( { widgetType: 'e-heading', container: containerId } );

		await editor.previewFrame.locator( `.elementor-element-${ headingId }` ).waitFor();
		await page.keyboard.press( 'Escape' );

		// Act
		const navigatorElement = page.locator( EditorSelectors.panels.navigator.getElement( headingId ) );

		await navigatorElement.waitFor();

		// Assert
		const inlineChildren = navigatorElement.locator( NAVIGATOR_INLINE_CHILD );

		await expect( inlineChildren ).toHaveCount( 0 );
	} );
} );
