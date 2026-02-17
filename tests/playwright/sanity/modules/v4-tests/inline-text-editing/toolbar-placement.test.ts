import { BrowserContext, Page, expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';

test.describe( 'Inline editing toolbar placement @v4-tests', () => {
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

	test.only( 'Edit the heading-title from the canvas and check the value in the panel and in the front', async () => {
		// Arrange
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		const flexboxId = await editor.addElement( { elType: 'e-flexbox' }, containerId );
		const headingId1 = await editor.addWidget( { widgetType: 'e-heading', container: flexboxId } );
		const headingId2 = await editor.addWidget( { widgetType: 'e-heading', container: flexboxId } );
		const headingId3 = await editor.addWidget( { widgetType: 'e-heading', container: flexboxId } );

		// Arrange.
		await test.step( 'Style flexbox to have height so vertical scroll is available', async () => {
			await editor.selectElement( flexboxId );
			await editor.v4Panel.openTab( 'style' );
			await editor.v4Panel.style.openSection( 'Size' );

			const heightControl = await editor.v4Panel.style.getControlByLabel( 'Size', 'Height' );
			await editor.v4Panel.style.changeSizeControl( heightControl, 1000, 'px' );
			await editor.v4Panel.style.closeSection( 'Size' );

			await editor.v4Panel.style.openSection( 'Layout' );
			await editor.v4Panel.style.setLayoutSectionValue( 'flex', {
				justifyContent: 'space-between',
			} );
			await editor.v4Panel.style.closeSection( 'Layout' );
		} );

		// Arrange.
		await test.step( 'Style heading 1 to be positioned on far left', async () => {
			await editor.selectElement( headingId1 );

			await editor.v4Panel.style.openSection( 'Position' );
			await editor.v4Panel.style.setPositionSectionValue( 'absolute', { left: { size: 0, unit: 'px' } } );
			await editor.v4Panel.style.closeSection( 'Position' );
		} );

		// Arrange.
		await test.step( 'Style heading 32 to be positioned on far right', async () => {
			await editor.selectElement( headingId3 );

			await editor.v4Panel.style.openSection( 'Position' );
			await editor.v4Panel.style.setPositionSectionValue( 'absolute', { right: { size: 0, unit: 'px' } } );
			await editor.v4Panel.style.closeSection( 'Position' );
		} );

		await editor.closeNavigatorIfOpen();

		await test.step( 'Test placement on far left', async () => {
			// Act
			await editor.selectInlineEditedText( headingId1, 'This' );

			// Assert.
			expect.soft( await page.screenshot( { fullPage: true } ) ).toMatchSnapshot( 'inline-editing-toolbar-placement-far-left.png' );
		} );

		await test.step( 'Test placement on center', async () => {
			// Act
			await editor.selectInlineEditedText( headingId2, 'This' );

			// Assert.
			expect.soft( await page.screenshot( { fullPage: true } ) ).toMatchSnapshot( 'inline-editing-toolbar-placement-center.png' );
		} );

		await test.step( 'Test placement on far right', async () => {
			// Act
			await editor.selectInlineEditedText( headingId3, 'This' );

			// Assert.
			expect.soft( await page.screenshot( { fullPage: true } ) ).toMatchSnapshot( 'inline-editing-toolbar-placement-far-right.png' );
		} );

		await test.step( 'Test placement on the top', async () => {
			const scrollAmount = await editor.previewFrame.evaluate( ( selector ) => {
				const rect = document.querySelector( selector )?.getBoundingClientRect();

				return rect?.top ?? 100;
			}, `[data-id="${ flexboxId }"].e-flexbox-base` );

			// Act.
			await page.mouse.wheel( 0, scrollAmount );

			// Assert.
			expect.soft( await page.screenshot( { fullPage: true } ) ).toMatchSnapshot( 'inline-editing-toolbar-placement-top.png' );
		} );
	} );
} );
