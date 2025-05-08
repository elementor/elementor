import WpAdminPage from '../pages/wp-admin-page';
import { parallelTest as test } from '../parallelTest';
import { BrowserContext, expect } from '@playwright/test';
import EditorPage from '../pages/editor-page';
import editorSelectors from '../selectors/editor-selectors';

test.describe( 'Atomic Widgets @v4-tests', () => {
	let editor: EditorPage;
	let wpAdmin: WpAdminPage;
	let context: BrowserContext;
	let page;
	const experimentName = 'e_atomic_elements';

	const atomicWidgets = [
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
		if ( wpAdmin ) {
			await wpAdmin.resetExperiments();
		}
		if ( context ) {
			await context.close();
		}
	} );

	atomicWidgets.forEach( ( widget ) => {
		test.describe( widget.name, () => {
			let containerId: string;

			test( 'Widget is displayed in panel', async () => {
				editor = await wpAdmin.openNewPage();
				await editor.openElementsPanel();
				const layout = editor.page.locator( editorSelectors.panels.elements.v4elements );
				await expect( layout ).toBeVisible();
				const container = layout.locator( '.title', { hasText: widget.title } );
				await expect( container ).toBeVisible();
			} );

			test( 'Widget is displayed in canvas after being added', async () => {
				containerId = await editor.addElement( { elType: 'container' }, 'document' );
				const widgetId = await editor.addWidget( { widgetType: widget.name, container: containerId } );
				const widgetSelector = editor.getWidgetSelector( widgetId );

				await expect( editor.getPreviewFrame().locator( widgetSelector ) ).toBeVisible();
				await expect( page.locator( widgetSelector ) ).toHaveScreenshot( `${ widget.name }-editor.png` );
			} );

			test( 'Widgets are displayed in front end', async () => {
				await editor.publishAndViewPage();
				const widgetSelector = `[data-id="${ containerId }"]`;
				await expect.soft( editor.page.locator( widgetSelector ) )
					.toHaveScreenshot( `${ widget.name }-published.png` );
			} );
		} );
	} );
} );
