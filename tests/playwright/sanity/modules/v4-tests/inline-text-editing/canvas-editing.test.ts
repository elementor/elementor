import { BrowserContext, Page, expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { INLINE_EDITING_SELECTORS } from './selectors/selectors';
import { getElementSelector } from '../../../../assets/elements-utils';
import topBarSelectors from '../../../../selectors/top-bar-selectors';
import EditorSelectors from '../../../../selectors/editor-selectors';

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

		await wpAdminPage.setExperiments( { e_atomic_elements: 'active', e_classes: 'active' } );

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
		const headingElement = editor.previewFrame.locator( `.elementor-element-${ headingId }` );

		await expect( headingElement ).toBeVisible();

		// Act
		const inlineEditor = await editor.triggerEditingElement( headingId );

		await expect( inlineEditor ).toBeVisible();
		await inlineEditor.clear();
		await page.keyboard.type( 'this is the first test' );
		await editor.selectInlineEditedText( headingId, 'this' );
		await editor.toggleInlineEditingAttribute( INLINE_EDITING_SELECTORS.attributes.underline );
		await page.keyboard.press( 'Escape', { delay: 100 } );
		await editor.selectElement( headingId );

		// Assert
		await expect( headingElement ).toContainText( NEW_TITLE );

		const panelInlineEditor = page
			.getByLabel( INLINE_EDITING_SELECTORS.panel.contentSectionLabel )
			.locator( INLINE_EDITING_SELECTORS.panel.inlineEditor );
		const panelHTML = await panelInlineEditor.innerHTML();

		expect( panelHTML ).toContain( '<u>this</u> is the first test' );

		await editor.publishAndViewPage();

		const publishedHeading = page.locator( INLINE_EDITING_SELECTORS.headingBase ).last();

		await expect( publishedHeading ).toContainText( NEW_TITLE );
		await expect( publishedHeading.locator( 'u' ) ).toContainText( 'this' );
	} );

	test( 'Delete entire content and enter new text without errors', async () => {
		const INITIAL_CONTENT = 'Initial heading text';
		const NEW_CONTENT = 'Brand new heading';

		// Arrange
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		const headingId = await editor.addWidget( { widgetType: 'e-heading', container: containerId } );
		const headingElement = editor.previewFrame.locator( `.elementor-element-${ headingId }` );

		await expect( headingElement ).toBeVisible();

		const inlineEditor = await editor.triggerEditingElement( headingId );

		await expect( inlineEditor ).toBeVisible();

		// Act
		await inlineEditor.clear();
		await page.keyboard.type( INITIAL_CONTENT );

		// Assert
		await expect( headingElement ).toContainText( INITIAL_CONTENT );
		await expect( headingElement ).toBeVisible();

		// Act
		await inlineEditor.clear();
		await page.keyboard.type( NEW_CONTENT );

		// Assert
		await expect( headingElement ).toContainText( NEW_CONTENT );
		await expect( headingElement ).toBeVisible();

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

		const inlineEditor = await editor.triggerEditingElement( headingId );

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

		const inlineEditor = await editor.triggerEditingElement( paragraphId );

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
		let headingElement = editor.previewFrame.locator( `.elementor-element-${ headingId }` );

		// Act.
		const inlineEditor = await editor.triggerEditingElement( headingId );
		headingElement = inlineEditor.locator( defaultAtomTags[ 'e-heading' ] );
		await headingElement.click( { delay: 50 } );
		await headingElement.click( { delay: 50 } );
		await headingElement.click( { delay: 50 } );
		await inlineEditor.fill( 'Hello' );

		// Assert
		await expect( headingElement ).toHaveText( 'Hello' );
	} );

	for ( const atom of supportedAtoms ) {
		test( `ensure html tags for styling aren't stripped by twig for ${ atom } widget`, async ( ) => {
		// Arrange
			const containerId = await editor.addElement( { elType: 'container' }, 'document' );
			const atomIds: Partial< Record< typeof supportedAtoms[number], string > > = {};
			const encodedExpectedOutput = '<strong draggable=\"true\">bold</strong>, <u>underline</u>, <s>strikethrough</s>, <sup>superscript</sup>, <sub>subscript</sub>, <em>italic</em>';

			atomIds[ atom ] = await editor.addWidget( { widgetType: atom, container: containerId } );

			await editor.previewFrame.locator( getElementSelector( atomIds[ atom ] ) ).waitFor();
			await editor.v4Panel.fillInlineEditing( atomTexts[ atom ] );

			// Unfocus.
			await page.keyboard.press( 'Escape' );

			// Act.
			for ( const attribute of testedAttributes ) {
				await editor.selectInlineEditedText( atomIds[ atom ], attribute );
				await editor.toggleInlineEditingAttribute( INLINE_EDITING_SELECTORS.attributes[ attribute ] );
				await page.keyboard.press( 'Escape' );
			}

			// Assert.
			let queryString = getElementSelector( atomIds[ atom ] ) + ' ' + defaultAtomTags[ atom ];

			expect( await editor.previewFrame.locator( queryString ).innerHTML() )
				.toContain( encodedExpectedOutput );

			// Unfocus.
			await page.keyboard.press( 'Escape' );

			await editor.publishAndViewPage();

			queryString = `${ defaultAtomTags[ atom ] }[data-interaction-id="${ atomIds[ atom ] }"]`;

			expect( ( await page.locator( queryString ).innerHTML() ) )
				.toContain( encodedExpectedOutput.replaceAll( ' draggable="true"', '' ) );
		} );
	}

	test( 'Ensure relevant focusing unmounts the inline editor from frame', async () => {
		// Arrange
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		const dummyDivBlockId = await editor.addElement( { elType: 'e-div-block' }, 'document' );

		const headingId = await editor.addWidget( { widgetType: 'e-heading', container: containerId } );
		const headingElement = editor.previewFrame.locator( EditorSelectors.v4.atomSelectors.heading.wrapper + ' > ' + EditorSelectors.v4.atomSelectors.heading.base );
		const inlineEditedHeading = editor.previewFrame.locator( INLINE_EDITING_SELECTORS.canvas.inlineEditor );

		// Act
		await editor.triggerEditingElement( headingId );

		// Assert
		await expect( inlineEditedHeading ).toBeVisible();
		await expect( headingElement ).not.toBeAttached();

		// Arrange
		await editor.triggerEditingElement( headingId );

		await test.step( 'Clicking the panel', async () => {
			// Act - click on a panel tab
			await editor.v4Panel.openTab( 'style' );

			// Assert
			await expect( headingElement ).toBeVisible();
			await expect( inlineEditedHeading ).not.toBeAttached();
		} );

		// Arrange.
		await editor.closeNavigatorIfOpen();
		await editor.triggerEditingElement( headingId );

		await test.step( 'Clicking the topbar', async () => {
			// Act - open navigator using topbar
			await editor.clickTopBarItem( topBarSelectors.navigator );

			// Assert
			await expect( headingElement ).toBeVisible();
			await expect( inlineEditedHeading ).not.toBeAttached();
		} );

		// Arrange.
		await editor.triggerEditingElement( headingId );

		await test.step( 'Clicking the navigator', async () => {
			// Act - clicking on navigator
			await editor.closeNavigatorIfOpen();

			// Assert
			await expect( headingElement ).toBeVisible();
			await expect( inlineEditedHeading ).not.toBeAttached();
		} );

		// Arrange.
		await editor.triggerEditingElement( headingId );

		await test.step( 'Clicking a different element', async () => {
			// Act - clicking on a different element
			await editor.previewFrame.locator( editor.getWidgetSelector( dummyDivBlockId ) ).click();

			// Assert
			await expect( headingElement ).toBeVisible();
			await expect( inlineEditedHeading ).not.toBeAttached();
		} );
	} );
} );
