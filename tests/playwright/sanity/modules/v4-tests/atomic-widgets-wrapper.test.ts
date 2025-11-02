import WpAdminPage from '../../../pages/wp-admin-page';
import { parallelTest as test } from '../../../parallelTest';
import { BrowserContext, expect } from '@playwright/test';
import EditorPage from '../../../pages/editor-page';

test.describe( 'Atomic Widgets Wrapper @v4-tests', () => {
	let editor: EditorPage;
	let wpAdmin: WpAdminPage;
	let context: BrowserContext;

	const atomicWidgets = [
		{ name: 'e-heading', title: 'Heading' },
		{ name: 'e-button', title: 'Button' },
		{ name: 'e-paragraph', title: 'Paragraph' },
	];

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		const page = await context.newPage();
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( {
			e_atomic_elements: 'active',
		} );
		await page.close();
	} );

	test.afterAll( async () => {
		await wpAdmin.resetExperiments();
		await context.close();
	} );

	atomicWidgets.forEach( ( widget ) => {
		test.only( `${ widget.name } is automatically wrapped in e-flexbox when added`, async ( { page, apiRequests }, testInfo ) => {
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			editor = await wpAdmin.openNewPage();

			await test.step( 'Add atomic widget to document', async () => {
				const widgetId = await editor.addWidget( { widgetType: widget.name } );
				const widgetSelector = editor.getWidgetSelector( widgetId );
				const widgetElement = editor.getPreviewFrame().locator( widgetSelector );

				await expect( widgetElement ).toBeVisible();

				const parentFlexboxId = await widgetElement.evaluate( ( node ) => {
					const flexboxParent = node.closest( '[data-element_type="e-flexbox"]' );
					return flexboxParent?.getAttribute( 'data-id' );
				} );

				expect( parentFlexboxId ).toBeTruthy();

				const flexboxSelector = `[data-id="${ parentFlexboxId }"]`;
				const flexboxElement = editor.getPreviewFrame().locator( flexboxSelector );

				await expect( flexboxElement ).toHaveAttribute( 'data-element_type', 'e-flexbox' );
			} );
		} );
	} );
} );
