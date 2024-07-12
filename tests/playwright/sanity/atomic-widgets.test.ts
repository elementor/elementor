import WpAdminPage from '../pages/wp-admin-page';
import { parallelTest as test } from '../parallelTest';
import { expect } from '@playwright/test';

test.describe( 'Atomic Widgets', () => {
	let editor;
	let wpAdmin;
	let context;

	const atomicWidgets = [
		{ name: 'a-heading', title: 'Atomic Heading' },
	];

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();

		const page = await context.newPage();

		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdmin.setExperiments( {
			atomic_widgets: 'active',
		} );

		editor = await wpAdmin.openNewPage();
	} );

	test.afterAll( async () => {
		await wpAdmin.resetExperiments();

		context.close();
	} );

	atomicWidgets.forEach( ( widget ) => {
		test.describe( widget.name, () => {
			test( 'Widget is displayed in panel', async () => {
				const layout = editor.page.locator( '#elementor-panel-category-general' );
				await layout.isVisible();
				const container = await layout.locator( '.title', { hasText: widget.title } );
				await expect( container ).toBeVisible();
			} );

			test( 'Widget is displayed in canvas after being added', async () => {
				const widgetId = await editor.addWidget( widget.name );
				const widgetSelector = '.elementor-element-' + widgetId;
				await expect( editor.getPreviewFrame().locator( widgetSelector ) ).toBeVisible();
			} );
		} );
	} );
} );

