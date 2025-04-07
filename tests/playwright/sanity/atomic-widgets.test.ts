import WpAdminPage from '../pages/wp-admin-page';
import { parallelTest as test } from '../parallelTest';
import { BrowserContext, expect } from '@playwright/test';
import EditorPage from '../pages/editor-page';

test.describe( 'Atomic Widgets', () => {
	let editor: EditorPage;
	let wpAdmin: WpAdminPage;
	let context: BrowserContext;
	const experimentName = 'e_atomic_elements';

	const atomicWidgets = [
		{ name: 'e-heading', title: 'Heading' },
	];

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();

		const page = await context.newPage();

		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdmin.setExperiments( {
			[ experimentName ]: 'active',
		} );

		editor = await wpAdmin.openNewPage();
	} );

	test.afterAll( async () => {
		await wpAdmin.resetExperiments();

		await context.close();
	} );

	atomicWidgets.forEach( ( widget ) => {
		test.describe( widget.name, () => {
			test( 'Widget is displayed in panel', async () => {
				const layout = editor.page.locator( '#elementor-panel-category-v4-elements' );
				await layout.isVisible();
				const container = layout.locator( '.title', { hasText: widget.title } );
				await expect( container ).toBeVisible();
			} );

			test( 'Widget is displayed in canvas after being added', async () => {
				const widgetId = await editor.addWidget( widget.name );
				const widgetSelector = '.elementor-element-' + widgetId;
				await expect( editor.getPreviewFrame().locator( widgetSelector ) ).toBeVisible();
			} );
		} );
	} );

	test( 'Check if the empty placeholder is displayed inside the Heading atom', async ( { page } ) => {
		await editor.addWidget( 'e-heading' );
		await page.fill( 'textarea[placeholder="Type your title here"]', '' );
		await page.waitForTimeout( 500 );

		const emptyViewPlaceholder = editor.getPreviewFrame().locator( '.elementor-widget .elementor-widget-empty-icon' );
		await emptyViewPlaceholder.waitFor();

		// Assert.
		expect( await emptyViewPlaceholder.count() ).toBe( 1 );
		await expect( emptyViewPlaceholder ).toHaveCSS( 'background-color', 'red' );
	} );

	test.skip( 'Widgets are displayed in front end', async () => {
		await editor.publishAndViewPage();
		await editor.page.setViewportSize( { width: 1920, height: 1080 } );
		await expect.soft( editor.page.locator( '.page-content' ) )
			.toHaveScreenshot( 'atomic-widgets-frontend.png' );
	} );
} );

