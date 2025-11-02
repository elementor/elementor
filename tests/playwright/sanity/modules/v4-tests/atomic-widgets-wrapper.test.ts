import WpAdminPage from '../../../pages/wp-admin-page';
import { parallelTest as test } from '../../../parallelTest';
import { expect } from '@playwright/test';

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
				await editor.openElementsPanel();
				const panelWidgetButton = page.locator( `#elementor-panel-category-v4-elements .elementor-panel-category-items :text-is("${ widget.title }")` );
				await panelWidgetButton.waitFor( { state: 'visible' } );
				await panelWidgetButton.click();

				widgetElement = editor.getPreviewFrame().locator( `[data-widget_type="${ widget.name }.default"]` ).first();
				await widgetElement.waitFor( { state: 'visible' } );
			} );

			await test.step( 'Verify widget is wrapped in e-flexbox', async () => {
				const parentElement = widgetElement.locator( '..' );
				await expect( parentElement ).toHaveAttribute( 'data-element_type', 'e-flexbox' );
			} );
		} );
	} );
} );
