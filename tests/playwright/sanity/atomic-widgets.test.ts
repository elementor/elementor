import WpAdminPage from '../pages/wp-admin-page';
import { parallelTest as test } from '../parallelTest';
import { BrowserContext, expect } from '@playwright/test';
import EditorPage from '../pages/editor-page';

test.describe.skip( 'Atomic Widgets @v4-tests', () => {
	let editor: EditorPage;
	let wpAdmin: WpAdminPage;
	let context: BrowserContext;
	let page;
	const experimentName = 'e_atomic_elements';

	const atomicWidgets = [
		{ name: 'e-flexbox', title: 'Flexbox' },
		{ name: 'e-div-block', title: 'Div Block' },
		{ name: 'e-heading', title: 'Heading' },
		{ name: 'e-image', title: 'Image' },
		{ name: 'e-paragraph', title: 'Paragraph' },
		{ name: 'e-svg', title: 'SVG' },
		{ name: 'e-button', title: 'Button' },
	];

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();

		page = await context.newPage();

		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdmin.setExperiments( {
			[ experimentName ]: 'active',
		} );
	} );

	test.afterAll( async () => {
		await wpAdmin.resetExperiments();

		await context.close();
	} );

	atomicWidgets.forEach( ( widget ) => {
		test.describe( widget.name, () => {
			test( 'Widget is displayed in panel', async () => {
				editor = await wpAdmin.openNewPage();
				await editor.openElementsPanel();
				const layout = editor.page.locator( '#elementor-panel-category-v4-elements' );
				await layout.isVisible();
				const container = layout.locator( '.title', { hasText: widget.title } );
				await expect( container ).toBeVisible();
			} );

			test( 'Widget is displayed in canvas after being added', async () => {
				const container = await editor.addElement( { elType: 'container' }, 'document' );
				const widgetId = await editor.addWidget( { widgetType: widget.name, container } );
				const widgetSelector = '.elementor-element-' + widgetId;
				await expect( editor.getPreviewFrame().locator( widgetSelector ) ).toBeVisible();
			} );

			test.skip( 'Widgets are displayed in front end', async () => {
				await editor.publishAndViewPage();
				await expect.soft( editor.page.locator( '.page-content' ) )
					.toHaveScreenshot( `${ widget.name }-published.png` );
			} );
		} );
	} );
} );
