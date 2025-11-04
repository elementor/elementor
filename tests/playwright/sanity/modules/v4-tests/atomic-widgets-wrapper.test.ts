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
				widgetElement = await editor.v4Panel.addAtomicWidget( widget.title, widget.name );
			} );

			await test.step( 'Verify widget is wrapped in e-flexbox', async () => {
				const parentElement = widgetElement.locator( '..' );
				await expect( parentElement ).toHaveAttribute( 'data-element_type', 'e-flexbox' );
			} );
		} );
	} );
} );
