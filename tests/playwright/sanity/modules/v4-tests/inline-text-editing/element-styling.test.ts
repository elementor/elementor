import { BrowserContext, Page, expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { INLINE_EDITING_SELECTORS } from './selectors/selectors';
import { UNITS } from '../typography/typography-constants';

const HEADING_WIDGET_SELECTOR = '.e-heading-base';
const TESTED_CONTENT = 'Very long Text With no Space To fiiiiiiiiiiiiiit';
const CONTENT_WORDS = TESTED_CONTENT.split( ' ' );

test.describe( 'Inline Editing Element Styling @v4-tests', () => {
	let wpAdminPage: WpAdminPage;
	let context: BrowserContext;
	let page: Page;
	let editor: EditorPage;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		page = await context.newPage();
		wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdminPage.setExperiments( { e_atomic_elements: 'active' } );
		await wpAdminPage.setExperiments( { 'v4-inline-text-editing': 'active', e_classes: 'active' } );

		editor = await wpAdminPage.openNewPage();
	} );

	test.afterAll( async () => {
		await wpAdminPage?.resetExperiments();
		await context.close();
	} );

	test( 'Compare appearance in frontend, editor - static and in edit mode', async ( {}, testInfo ) => {
		// Arrange.
		let headingElement = editor.previewFrame.locator( HEADING_WIDGET_SELECTOR );
		const editedHeadingElement = editor.previewFrame.locator( INLINE_EDITING_SELECTORS.canvas.inlineEditor );

		// Act.
		const flexboxId = await editor.addElement( { elType: 'e-flexbox' }, 'document' );
		const headingId = await editor.addWidget( { widgetType: 'e-heading', container: flexboxId } );

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

		await test.step( 'Style widget', async () => {
			await editor.v4Panel.openTab( 'style' );

			await editor.v4Panel.style.openSection( 'Spacing' );
			await editor.v4Panel.style.setSpacingValue( 'Margin', 'Top', 30, UNITS.px );
			await editor.v4Panel.style.closeSection( 'Spacing' );

			await editor.v4Panel.style.openSection( 'Size' );
			await editor.v4Panel.style.setSizeSectionValue( 'Width', 100, UNITS.px );
			await editor.v4Panel.style.closeSection( 'Size' );

			await editor.v4Panel.style.openSection( 'Position' );
			await editor.v4Panel.style.setPositionValue( 'absolute', { Top: { size: 40, unit: UNITS.px } } );
			await editor.v4Panel.style.closeSection( 'Position' );

			await editor.v4Panel.style.openSection( 'Typography' );
			await editor.v4Panel.style.setFontFamily( 'Times New Roman' );
			await editor.v4Panel.style.setFontSize( 33, UNITS.px );
			await editor.v4Panel.style.setFontWeight( 900 );
			await editor.v4Panel.style.setWordSpacing( 20, UNITS.px );
			await editor.v4Panel.style.setFontColor( '#BBBBBB' );
			await editor.v4Panel.style.setLineHeight( 2, UNITS.em );
			await editor.v4Panel.style.setLetterSpacing( 7, UNITS.px );
			await editor.v4Panel.style.closeSection( 'Typography' );

			await editor.v4Panel.style.openSection( 'Background' );
			await editor.v4Panel.style.setBackgroundColor( '#333333' );
			await editor.v4Panel.style.closeSection( 'Background' );

			await editor.v4Panel.style.openSection( 'Border' );
			await editor.v4Panel.style.setBorderWidth( 1, UNITS.px );
			await editor.v4Panel.style.setBorderColor( '#BBBBBB' );
			await editor.v4Panel.style.setBorderRadius( 10, UNITS.px );
			await editor.v4Panel.style.setBorderType( 'solid' );
			await editor.v4Panel.style.closeSection( 'Border' );

			await editor.v4Panel.style.selectClassState( 'hover' );

			await editor.v4Panel.style.openSection( 'Typography' );
			await editor.v4Panel.style.setFontColor( '#990000' );
			await editor.v4Panel.style.closeSection( 'Typography' );
		} );

		await test.step( 'Publish and reload page', async () => {
			await editor.publishPage();
			await page.reload();
			await page.waitForLoadState( 'load', { timeout: 20000 } );
			await wpAdminPage.waitForPanel();
			editor = new EditorPage( page, testInfo );
			headingElement = editor.previewFrame.locator( HEADING_WIDGET_SELECTOR );
			await headingElement.waitFor( { timeout: 20000 } );
		} );

		await test.step( 'Heading in editor - static', async () => {
			// Assert.
			await expect.soft( headingElement ).toHaveScreenshot( 'styled-static-heading.png' );

			// Act.
			await headingElement.hover();

			// Assert.
			await expect.soft( headingElement ).toHaveScreenshot( 'styled-static-heading-hover.png' );
		} );

		await test.step( 'Heading in editor - in edit mode', async () => {
			// Act.
			await editor.triggerEditingElement( headingId );

			// Assert.
			await expect.soft( editedHeadingElement ).toHaveScreenshot( 'styled-edited-heading.png' );

			// Act.
			await editedHeadingElement.hover();

			// Assert.
			await expect.soft( editedHeadingElement ).toHaveScreenshot( 'styled-edited-heading-hover.png' );
		} );

		await test.step( 'Frontend - styled heading', async () => {
			const publishedHeadingElement = page.locator( HEADING_WIDGET_SELECTOR );

			// Act.
			await editor.publishAndViewPage();
			await publishedHeadingElement.waitFor();

			// Assert.
			await expect.soft( publishedHeadingElement ).toHaveScreenshot( 'styled-frontend-heading.png' );

			// Act.
			await publishedHeadingElement.hover();

			// Assert.
			await expect.soft( publishedHeadingElement ).toHaveScreenshot( 'styled-frontend-heading-hover.png' );
		} );
	} );
} );
