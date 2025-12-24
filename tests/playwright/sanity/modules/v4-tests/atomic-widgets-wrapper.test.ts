import WpAdminPage from '../../../pages/wp-admin-page';
import { parallelTest as test } from '../../../parallelTest';
import { expect } from '@playwright/test';
import ContextMenu from '../../../pages/widgets/context-menu';
import EditorSelectors from '../../../selectors/editor-selectors';

test.describe( 'Atomic Widgets Wrapper @v4-tests', () => {
	const atomicWidgets = [
		{ name: 'e-heading', title: 'Heading' },
		{ name: 'e-button', title: 'Button' },
		{ name: 'e-paragraph', title: 'Paragraph' },
	];

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( {
			e_atomic_elements: 'active',
		} );
		await page.close();
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await page.close();
	} );

	atomicWidgets.forEach( ( widget ) => {
		test( `${ widget.name } is automatically wrapped in e-flexbox when added`, async ( { page, apiRequests }, testInfo ) => {
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			const editor = await wpAdmin.openNewPage();

			let widgetElement;

			await test.step( 'Add atomic widget by clicking on panel', async () => {
				widgetElement = await editor.v4Panel.addAtomicWidget( widget.title, widget.name );
			} );

			await test.step( 'Verify widget is wrapped in e-flexbox', async () => {
				const parentElement = widgetElement.locator( '..' );
				const classAttr = await parentElement.getAttribute( 'class' );

				await expect( parentElement ).toHaveAttribute( 'data-element_type', 'e-flexbox' );
				expect( classAttr ).toContain( 'e-flexbox-base' );
			} );
		} );
	} );

	test( 'Atomic widget is automatically wrapped in e-flexbox when copy/pasted', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		const contextMenu = new ContextMenu( page, testInfo );

		let widgetElement;
		let widgetElementId;

		await test.step( 'Add atomic widget by clicking on panel', async () => {
			widgetElement = await editor.v4Panel.addAtomicWidget( 'Button', 'e-button' );
			widgetElementId = await widgetElement.getAttribute( 'data-id' );

			expect( widgetElementId ).toBeTruthy();
		} );

		await test.step( 'Copy the atomic widget from navigator', async () => {
			const navigatorItem = page.locator( EditorSelectors.panels.navigator.getElementItem( widgetElementId ) );
			await navigatorItem.click( { button: 'right' } );
			const copyMenuItem = page.getByRole( 'menuitem', { name: 'Copy' } );
			await copyMenuItem.click();
		} );

		await test.step( 'Paste the atomic widget', async () => {
			await contextMenu.pasteElement( EditorSelectors.addSectionInner );
		} );

		await test.step( 'Verify pasted widget is wrapped in e-flexbox', async () => {
			const pastedWidget = editor.getPreviewFrame().locator( EditorSelectors.eflexboxWidget( 'e-button' ) ).last();
			await pastedWidget.waitFor( { state: 'visible' } );
			const parentElement = pastedWidget.locator( '..' );

			await expect( parentElement ).toHaveAttribute( 'data-element_type', 'e-flexbox' );
		} );
	} );
} );
