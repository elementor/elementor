import { BrowserContext, Page, expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { INLINE_EDITING_SELECTORS } from './selectors/selectors';
import { getElementSelector } from '../../../../assets/elements-utils';

const testedAttributes = Object.keys( INLINE_EDITING_SELECTORS.attributes ).filter( ( attribute ) => attribute !== 'link' );

const attributesString = testedAttributes.join( ', ' );

test.describe( 'Inline Editing Canvas @v4-tests', () => {
	const supportedAtoms = Object.values( INLINE_EDITING_SELECTORS.supportedAtoms );

	const atomTexts = {
		'e-heading': 'Title with: ' + attributesString,
		'e-paragraph': 'Paragraph with: ' + attributesString,
	};

	const defaultAtomTags:Record< typeof supportedAtoms[number], string > = {
		'e-heading': 'h2',
		'e-paragraph': 'p',
	};

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

	test( 'Edit the heading-title from the canvas and check the value in the panel and in the front', async () => {
		const NEW_TITLE = 'this is the first test';

		// Arrange
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		const headingId = await editor.addWidget( { widgetType: 'e-heading', container: containerId } );
		const previewFrame = editor.getPreviewFrame();
		const headingElement = previewFrame.locator( `.elementor-element-${ headingId }` );

		await expect( headingElement ).toBeVisible();

		// Act
		await headingElement.dblclick();
		const inlineEditor = editor.previewFrame.locator( INLINE_EDITING_SELECTORS.panel.inlineEditor );

		await expect( inlineEditor ).toBeVisible();
		await inlineEditor.clear();
		await page.keyboard.press( 'ControlOrMeta+U' );
		await page.keyboard.type( 'this' );
		await page.keyboard.press( 'ControlOrMeta+U' );
		await page.keyboard.type( ' is the first test' );

		// Assert
		await expect( headingElement ).toContainText( NEW_TITLE );

		const panelInlineEditor = page
			.getByLabel( INLINE_EDITING_SELECTORS.panel.contentSectionLabel )
			.locator( INLINE_EDITING_SELECTORS.panel.inlineEditor );
		const panelHTML = await panelInlineEditor.innerHTML();

		expect( panelHTML ).toContain( '<u>this</u>&nbsp;is the first test' );

		await editor.publishAndViewPage();
		const publishedHeading = page.locator( INLINE_EDITING_SELECTORS.headingBase ).last();

		await expect( publishedHeading ).toContainText( NEW_TITLE );

		const underlinedText = publishedHeading.locator( 'u' );

		await expect( underlinedText ).toBeVisible();

		await expect( underlinedText ).toContainText( 'this' );
	} );

	test( 'Delete entire content and enter new text without errors', async () => {
		const INITIAL_CONTENT = 'Initial heading text';
		const NEW_CONTENT = 'Brand new heading';

		// Arrange
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		const headingId = await editor.addWidget( { widgetType: 'e-heading', container: containerId } );
		const previewFrame = editor.getPreviewFrame();
		const headingElement = previewFrame.locator( `.elementor-element-${ headingId }` );

		await expect( headingElement ).toBeVisible();

		await headingElement.dblclick();
		const inlineEditor = editor.previewFrame.locator( INLINE_EDITING_SELECTORS.canvas.inlineEditor );

		await expect( inlineEditor ).toBeVisible();

		// Act
		await page.keyboard.press( 'ControlOrMeta+A' );

		for ( let i = 0; i < INITIAL_CONTENT.length; i++ ) {
			await page.keyboard.type( INITIAL_CONTENT.charAt( i ) );
		}

		// Assert
		await expect( headingElement ).toContainText( INITIAL_CONTENT );
		await expect( headingElement ).toBeVisible();

		// Act
		await page.keyboard.press( 'ControlOrMeta+A' );
		await page.keyboard.press( 'Delete' );

		for ( let i = 0; i < NEW_CONTENT.length; i++ ) {
			await page.keyboard.type( NEW_CONTENT.charAt( i ) );
		}

		// Assert
		await expect( headingElement ).toContainText( NEW_CONTENT );
		await expect( headingElement ).toBeVisible();

		await editor.selectElement( containerId );
		await editor.selectElement( headingId );
		const panelInlineEditor = page
			.getByLabel( INLINE_EDITING_SELECTORS.panel.contentSectionLabel )
			.locator( INLINE_EDITING_SELECTORS.panel.inlineEditor );
		const panelHTML = await panelInlineEditor.innerHTML();

		expect( panelHTML ).toContain( NEW_CONTENT );
	} );

	test( "Style edited element differently than hello theme's default styles", async () => {
		// Arrange
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		const headingId = await editor.addWidget( { widgetType: 'e-heading', container: containerId } );
		let headingElement = editor.previewFrame.locator( `.elementor-element-${ headingId }` );

		await headingElement.waitFor();

		// Act
		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.openSection( 'Typography' );
		await editor.v4Panel.style.setFontWeight( 100 );
		await headingElement.dblclick();

		const inlineEditor = editor.previewFrame.locator( INLINE_EDITING_SELECTORS.canvas.inlineEditor );

		await inlineEditor.waitFor();

		headingElement = inlineEditor.locator( defaultAtomTags[ 'e-heading' ] );

		// Assert
		await expect.soft( headingElement ).toHaveCSS( 'font-weight', '100' );
	} );

	test( 'Global classes styles should render while editing', async () => {
		// Arrange
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		const paragraphId = await editor.addWidget( { widgetType: 'e-paragraph', container: containerId } );
		let paragraphElement = editor.previewFrame.locator( `.elementor-element-${ paragraphId }` );

		await page.waitForTimeout( 1000 );

		// Act
		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.addGlobalClass( 'hello' );
		await editor.v4Panel.style.openSection( 'Typography' );
		await editor.v4Panel.style.setFontSize( 100, 'px' );
		await paragraphElement.dblclick();

		const inlineEditor = editor.previewFrame.locator( INLINE_EDITING_SELECTORS.canvas.inlineEditor );

		await inlineEditor.waitFor();

		paragraphElement = inlineEditor.locator( defaultAtomTags[ 'e-paragraph' ] );

		// Assert
		await expect.soft( paragraphElement ).toHaveCSS( 'font-size', '100px' );
		await expect.soft( paragraphElement ).toHaveClass( /hello.*/ );
		await editor.v4Panel.style.removeGlobalClass( 'hello' );
	} );

	test( 'Allow select all text by triple clicking when editor is rendered', async () => {
		// Arrange
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		const headingId = await editor.addWidget( { widgetType: 'e-heading', container: containerId } );
		const previewFrame = editor.getPreviewFrame();
		let headingElement = previewFrame.locator( `.elementor-element-${ headingId }` );

		// Act.
		await headingElement.dblclick();

		const inlineEditor = editor.previewFrame.locator( INLINE_EDITING_SELECTORS.canvas.inlineEditor );

		await inlineEditor.waitFor();
		await page.waitForTimeout( 1000 );

		headingElement = inlineEditor.locator( defaultAtomTags[ 'e-heading' ] );

		await headingElement.click( { clickCount: 3 } );
		await page.keyboard.type( 'Hello' );

		// Assert
		await expect( headingElement ).toHaveText( 'Hello' );
	} );

	test( "ensure html tags for styling aren't stripped by twig", async ( ) => {
		// Arrange
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		const atomIds: Partial< Record< typeof supportedAtoms[number], string > > = {};
		const encodedExpectedOutput = 'Title with: <strong>bold</strong>, <u>underline</u>, <s>strikethrough</s>, <sup>superscript</sup>, <sub>subscript</sub>';

		for ( const atom of supportedAtoms ) {
			atomIds[ atom ] = await editor.addWidget( { widgetType: atom, container: containerId } );

			await editor.previewFrame.locator( getElementSelector( atomIds[ atom ] ) ).waitFor();
			await editor.v4Panel.fillInlineEditing( atomTexts[ atom ] );
		}

		// Unfocus.
		await page.keyboard.press( 'Escape' );

		// Act.
		for ( const atom of supportedAtoms ) {
			for ( const attribute of testedAttributes ) {
				await editor.selectInlineEditedText( atomIds[ atom ], attribute );
				await editor.toggleInlineEditingAttribute( attribute );
				await page.keyboard.press( 'Escape' );
			}
		}

		// Unfocus.
		await page.keyboard.press( 'Escape' );

		// Assert.
		for ( const atom of supportedAtoms ) {
			const queryString = getElementSelector( atomIds[ atom ] ) + ' ' + defaultAtomTags[ atom ];

			expect( await editor.previewFrame.locator( queryString ).innerHTML() )
				.toBe( encodedExpectedOutput );
		}

		// Unfocus.
		await page.keyboard.press( 'Escape' );

		await editor.publishAndViewPage();

		for ( const atom of supportedAtoms ) {
			const queryString = `${ defaultAtomTags[ atom ] }[data-interaction-id="${ atomIds[ atom ] }"]`;

			expect( ( await page.locator( queryString ).innerHTML() ) )
				.toContain( encodedExpectedOutput );
		}
	} );
} );
