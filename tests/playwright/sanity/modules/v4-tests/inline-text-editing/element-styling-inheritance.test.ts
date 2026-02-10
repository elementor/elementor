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

const FLEXBOX_WITH_DIMENSIONS = 'flexbox-with-dimensions';
const HEADING_AND_FLEXBOX_WITH_DIMENSIONS = 'heading-with-dimensions';

test.describe( 'Inline Editing Element Styling @v4-tests', () => {
	let wpAdminPage: WpAdminPage;
	let context: BrowserContext;
	let page: Page;
	let editor: EditorPage;
	let pageId: string;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		page = await context.newPage();
		wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdminPage.setExperiments( { e_atomic_elements: 'active', e_classes: 'active' } );

		editor = await wpAdminPage.openNewPage();
		pageId = await editor.getPageId();
	} );

	test.afterAll( async () => {
		await wpAdminPage?.resetExperiments();
		await context.close();
	} );

	test( 'Validate styling stays the same while editing, and in the frontend: position absolute', async ( { apiRequests }, testInfo ) => {
		// Arrange & act.
		const flexboxId = await editor.addElement( { elType: EditorSelectors.v4.atoms.flexbox }, 'document' );
		const headingId = await editor.addWidget( { widgetType: EditorSelectors.v4.atoms.heading, container: flexboxId } );

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

			const publishedHeadingElement = page.locator( EditorSelectors.v4.atomSelectors.heading.base );

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
		const divBlocElement = editor.previewFrame.locator( EditorSelectors.v4.atomSelectors.divBlock.base );

		await editor.closeNavigatorIfOpen();

		const flexboxElement = editor.previewFrame.locator( EditorSelectors.v4.atomSelectors.flexbox.base );
		const headingElement = editor.previewFrame.locator( EditorSelectors.v4.atomSelectors.heading.base );

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

		await test.step( 'Heading in editor is styled the same when editing or not', async () => {
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

	test( 'Heading height should not change when entering inline edit mode in a flex row layout', async () => {
		editor = await wpAdminPage.openNewPage();

		const outerFlexboxId = await editor.addElement( { elType: EditorSelectors.v4.atoms.flexbox }, 'document' );

		const leftFlexboxId = await editor.addElement( { elType: EditorSelectors.v4.atoms.flexbox }, outerFlexboxId );
		const rightFlexboxId = await editor.addElement( { elType: EditorSelectors.v4.atoms.flexbox }, outerFlexboxId );

		await test.step( 'Set left flexbox to column direction', async () => {
			await editor.selectElement( leftFlexboxId );
			await editor.v4Panel.openTab( 'style' );
			await editor.v4Panel.style.openSection( 'Layout' );

			const layoutSection = await editor.v4Panel.style.getSectionContentByLabel( 'Layout' );
			await layoutSection.getByRole( 'button', { name: 'Column', exact: true } ).click();

			await editor.v4Panel.style.closeSection( 'Layout' );
		} );

		const headingId = await editor.addWidget( { widgetType: EditorSelectors.v4.atoms.heading, container: leftFlexboxId } );
		await editor.addWidget( { widgetType: EditorSelectors.v4.atoms.paragraph, container: leftFlexboxId } );
		await editor.addWidget( { widgetType: EditorSelectors.v4.atoms.button, container: leftFlexboxId } );
		await editor.addWidget( { widgetType: EditorSelectors.v4.atoms.image, container: rightFlexboxId } );

		await editor.closeNavigatorIfOpen();

		const headingH2 = editor.previewFrame.locator( `.elementor-element-${ headingId } ${ EditorSelectors.v4.atomSelectors.heading.base }` );

		await headingH2.waitFor();

		const heightBeforeEditing = await headingH2.boundingBox().then( ( box ) => box?.height ?? 0 );

		expect( heightBeforeEditing ).toBeGreaterThan( 0 );

		await editor.triggerEditingElement( headingId );

		const inlineEditor = editor.previewFrame.locator( `.elementor-element-${ headingId } ${ INLINE_EDITING_SELECTORS.canvas.inlineEditor }` );
		await expect( inlineEditor ).toBeAttached();

		const editedH2 = editor.previewFrame.locator( `.elementor-element-${ headingId } h2` );
		await editedH2.waitFor();

		const heightDuringEditing = await editedH2.boundingBox().then( ( box ) => box?.height ?? 0 );

		expect( heightDuringEditing ).toBeGreaterThan( 0 );
		expect( heightDuringEditing ).toEqual( heightBeforeEditing );
	} );

	test( 'Validate inheritance of dimension while editing', async () => {
		// Arrange
		editor = await wpAdminPage.openNewPage();
		const flexboxId = await editor.addElement( { elType: EditorSelectors.v4.atoms.flexbox }, 'document' );
		const flexboxElement = editor.previewFrame.locator( EditorSelectors.v4.atomSelectors.flexbox.base );

		const headingId = await editor.addWidget( { widgetType: EditorSelectors.v4.atoms.heading, container: flexboxId } );

		// Act.
		await test.step( 'Edit content', async () => {
			await editor.selectElement( headingId );
			await editor.v4Panel.openTab( 'general' );
			await editor.v4Panel.fillInlineEditing( TESTED_CONTENT );
		} );

		await editor.v4Panel.openTab( 'style' );

		await test.step( 'Style widget - typography', async () => {
			await editor.v4Panel.style.openSection( 'Typography' );
			await editor.v4Panel.style.setFontColor( '#FFFFFF' );
			await editor.v4Panel.style.closeSection( 'Typography' );
		} );

		await test.step( 'Style widget - background', async () => {
			await editor.v4Panel.style.openSection( 'Background' );
			await editor.v4Panel.style.setBackgroundColor( '#333333' );
			await editor.v4Panel.style.closeSection( 'Background' );
		} );

		await test.step( 'Style flexbox', async () => {
			await editor.selectElement( flexboxId );
			await editor.v4Panel.openTab( 'style' );

			await editor.v4Panel.style.openSection( 'Size' );
			await editor.v4Panel.style.setSizeSectionValue( 'Height', 700, UNITS.px );
			await editor.v4Panel.style.setSizeSectionValue( 'Width', 1000, UNITS.px );
			await editor.v4Panel.style.closeSection( 'Size' );

			await editor.v4Panel.style.openSection( 'Spacing' );
			await editor.v4Panel.style.setSpacingSectionValue( 'Padding', 'Top', 30, UNITS.px );
			await editor.v4Panel.style.closeSection( 'Spacing' );

			await editor.v4Panel.style.openSection( 'Background' );
			await editor.v4Panel.style.setBackgroundColor( '#6699AA' );
			await editor.v4Panel.style.closeSection( 'Background' );
		} );

		await editor.closeNavigatorIfOpen();

		// Assert.
		await expect.soft( flexboxElement ).toHaveScreenshot( getScreenshotName( FLEXBOX_WITH_DIMENSIONS ) );

		// Act.
		await editor.triggerEditingElement( headingId );

		// Assert.
		await expect.soft( flexboxElement ).toHaveScreenshot( getScreenshotName( FLEXBOX_WITH_DIMENSIONS ) );

		await test.step( 'change heading height', async () => {
			await editor.selectElement( headingId );
			await editor.v4Panel.openTab( 'style' );

			await editor.v4Panel.style.openSection( 'Size' );
			await editor.v4Panel.style.setSizeSectionValue( 'Height', 100, UNITS.px );
			await editor.v4Panel.style.setSizeSectionValue( 'Width', 400, UNITS.px );
			await editor.v4Panel.style.closeSection( 'Size' );
		} );

		await editor.closeNavigatorIfOpen();

		// Assert.
		await expect.soft( flexboxElement ).toHaveScreenshot( getScreenshotName( HEADING_AND_FLEXBOX_WITH_DIMENSIONS ) );

		// Act.
		await editor.triggerEditingElement( headingId );

		// Assert.
		await expect.soft( flexboxElement ).toHaveScreenshot( getScreenshotName( HEADING_AND_FLEXBOX_WITH_DIMENSIONS ) );
	} );
} );

function getScreenshotName( name: string ) {
	return `${ name }.png`;
}
