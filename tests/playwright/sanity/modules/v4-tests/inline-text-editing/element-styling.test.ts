import { BrowserContext, Page, expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { INLINE_EDITING_SELECTORS } from './selectors/selectors';
import { UNITS } from '../typography/typography-constants';
import EditorSelectors from '../../../../selectors/editor-selectors';

const TESTED_CONTENT = 'Very long Text With no Space To fiiiiiiiiiiiiiit';
const CONTENT_WORDS = TESTED_CONTENT.split( ' ' );

const FRONTEND_SCREENSHOT = 'styled-frontend-heading';
const FRONTEND_SCREENSHOT_HOVER = FRONTEND_SCREENSHOT + '-hover';

const EDITOR_STATIC_SCREENSHOT = 'styled-static-heading';
const EDITOR_STATIC_SCREENSHOT_HOVER = EDITOR_STATIC_SCREENSHOT + '-hover';

test.describe( 'Inline Editing Element Styling @v4-tests', () => {
	let wpAdminPage: WpAdminPage;
	let context: BrowserContext;
	let page: Page;
	let editor: EditorPage;
	let pageId: string;
	let headingId: string;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		page = await context.newPage();
		wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdminPage.setExperiments( { e_atomic_elements: 'active' } );
		await wpAdminPage.setExperiments( { 'v4-inline-text-editing': 'active', e_classes: 'active' } );

		editor = await wpAdminPage.openNewPage();
		pageId = await editor.getPageId();
	} );

	test.afterAll( async () => {
		await wpAdminPage?.resetExperiments();
		await context.close();
	} );

	test.only( 'Validate styling in editor, and that it does not get affected in frontend', async ( { apiRequests }, testInfo ) => {
		// Arrange & act.
		const flexboxId = await editor.addElement( { elType: EditorSelectors.v4.atoms.flexbox }, 'document' );
		headingId = await editor.addWidget( { widgetType: EditorSelectors.v4.atoms.heading, container: flexboxId } );

		await test.step( 'Style flexbox to prevent footer from overlapping', async () => {
			await editor.selectElement( flexboxId );
			await editor.v4Panel.openTab( 'style' );
			await editor.v4Panel.style.openSection( 'Size' );
			await editor.v4Panel.style.setSizeSectionValue( 'Height', 700, UNITS.px );
			await editor.v4Panel.style.closeSection( 'Size' );
		} );

		await test.step( 'Edit content', async () => {
			await editor.selectElement( headingId );
			await editor.v4Panel.openTab( 'general' );
			await editor.v4Panel.fillInlineEditing( TESTED_CONTENT );

			await editor.selectInlineEditedText( headingId, CONTENT_WORDS[ 0 ] );
			await editor.toggleInlineEditingAttribute( INLINE_EDITING_SELECTORS.attributes.underline );

			await editor.selectInlineEditedText( headingId, CONTENT_WORDS[ 2 ] );
			await editor.toggleInlineEditingAttribute( INLINE_EDITING_SELECTORS.attributes.italic );

			await editor.selectInlineEditedText( headingId, CONTENT_WORDS[ 3 ] );
			await editor.toggleInlineEditingAttribute( INLINE_EDITING_SELECTORS.attributes.strikethrough );
		} );

		await editor.v4Panel.openTab( 'style' );

		await test.step( 'Style widget - spacing', async () => {
			await editor.v4Panel.style.openSection( 'Spacing' );
			await editor.v4Panel.style.setSpacingSectionValue( 'Margin', 'Top', 30, UNITS.px );
			await editor.v4Panel.style.closeSection( 'Spacing' );
		} );

		await test.step( 'Style widget - size', async () => {
			await editor.v4Panel.style.openSection( 'Size' );
			await editor.v4Panel.style.setSizeSectionValue( 'Width', 100, UNITS.px );
			await editor.v4Panel.style.closeSection( 'Size' );
		} );

		await test.step( 'Style widget - position', async () => {
			await editor.v4Panel.style.openSection( 'Position' );
			await editor.v4Panel.style.setPositionSectionValue( 'absolute', { Top: { size: 40, unit: UNITS.px } } );
			await editor.v4Panel.style.closeSection( 'Position' );
		} );

		await test.step( 'Style widget - typography', async () => {
			await editor.v4Panel.style.openSection( 'Typography' );
			await editor.v4Panel.style.setFontFamily( 'Times New Roman' );
			await editor.v4Panel.style.setFontSize( 33, UNITS.px );
			await editor.v4Panel.style.setFontWeight( 900 );
			await editor.v4Panel.style.setWordSpacing( 20, UNITS.px );
			await editor.v4Panel.style.setFontColor( '#BBBBBB' );
			await editor.v4Panel.style.setLineHeight( 2, UNITS.em );
			await editor.v4Panel.style.setLetterSpacing( 7, UNITS.px );
			await editor.v4Panel.style.closeSection( 'Typography' );
		} );

		await test.step( 'Style widget - background', async () => {
			await editor.v4Panel.style.openSection( 'Background' );
			await editor.v4Panel.style.setBackgroundColor( '#333333' );
			await editor.v4Panel.style.closeSection( 'Background' );
		} );

		await test.step( 'Style widget - border', async () => {
			await editor.v4Panel.style.openSection( 'Border' );
			await editor.v4Panel.style.setBorderWidth( 1, UNITS.px );
			await editor.v4Panel.style.setBorderColor( '#BBBBBB' );
			await editor.v4Panel.style.setBorderRadius( 10, UNITS.px );
			await editor.v4Panel.style.setBorderType( 'solid' );
			await editor.v4Panel.style.closeSection( 'Border' );
		} );

		await test.step( 'Style widget:hover - typography', async () => {
			await editor.v4Panel.style.selectClassState( 'hover' );

			await editor.v4Panel.style.openSection( 'Typography' );
			await editor.v4Panel.style.setFontColor( '#990000' );
			await editor.v4Panel.style.closeSection( 'Typography' );
		} );

		await test.step( 'Frontend - styled heading', async () => {
			// Act.
			await editor.publishPage();
			await page.goto( `/?p=${ pageId }` );

			const publishedHeadingElement = page.locator( EditorSelectors.v4.atomSelectors.heading );

			await publishedHeadingElement.waitFor();

			// Assert.
			await expect.soft( publishedHeadingElement ).toHaveScreenshot( getScreenshotName( FRONTEND_SCREENSHOT ) );

			// Act.
			await publishedHeadingElement.hover();

			// Assert.
			await expect.soft( publishedHeadingElement ).toHaveScreenshot( getScreenshotName( FRONTEND_SCREENSHOT_HOVER ) );
		} );

		await test.step( 'Go back to editor', async () => {
			wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );
			editor = await wpAdminPage.editExistingPostWithElementor( pageId, { page, testInfo } );
		} );

		// Arrange & Act.
		// Triggering editing mode forces heading to stay hovered.
		// Add a div block so that it can be hovered, and force the heading to be "unhovered".
		await editor.addElement( { elType: EditorSelectors.v4.atoms.divBlock }, 'document' );
		const divBlocElement = editor.previewFrame.locator( EditorSelectors.v4.atomSelectors.divBlock );

		const flexboxElement = editor.previewFrame.locator( EditorSelectors.v4.atomSelectors.flexbox );
		const headingElement = editor.previewFrame.locator( EditorSelectors.v4.atomSelectors.heading );

		await editor.closeNavigatorIfOpen();

		await test.step( 'Heading in editor is styled like in frontend', async () => {
			// Arrange.
			await expect.soft( headingElement ).toHaveScreenshot( getScreenshotName( FRONTEND_SCREENSHOT ) );
			await expect.soft( flexboxElement ).toHaveScreenshot( getScreenshotName( EDITOR_STATIC_SCREENSHOT ) );

			// Act.
			await headingElement.hover();

			// Assert.
			await expect.soft( headingElement ).toHaveScreenshot( getScreenshotName( FRONTEND_SCREENSHOT_HOVER ) );
			await expect.soft( flexboxElement ).toHaveScreenshot( getScreenshotName( EDITOR_STATIC_SCREENSHOT_HOVER ) );
		} );

		await test.step( 'Heading in editor is styled the same when editor or not', async () => {
			// Arrange & assert.
			await expect.soft( flexboxElement ).toHaveScreenshot( getScreenshotName( EDITOR_STATIC_SCREENSHOT ) );
			await headingElement.hover();
			await expect.soft( flexboxElement ).toHaveScreenshot( getScreenshotName( EDITOR_STATIC_SCREENSHOT_HOVER ) );

			// Act.
			await editor.triggerEditingElement( headingId );

			// Assert.
			// Already hovered at this stage
			await expect.soft( flexboxElement ).toHaveScreenshot( getScreenshotName( EDITOR_STATIC_SCREENSHOT_HOVER ) );
			await expect( editor.previewFrame.locator( INLINE_EDITING_SELECTORS.canvas.inlineEditor ) ).toBeAttached();

			// Act.
			// Force heading to be "unhovered
			await divBlocElement.hover();

			// Assert.
			await expect.soft( flexboxElement ).toHaveScreenshot( getScreenshotName( EDITOR_STATIC_SCREENSHOT ) );
			await expect( editor.previewFrame.locator( INLINE_EDITING_SELECTORS.canvas.inlineEditor ) ).toBeAttached();
		} );
	} );
} );

function getScreenshotName( name: string ) {
	return `${ name }.png`;
}
