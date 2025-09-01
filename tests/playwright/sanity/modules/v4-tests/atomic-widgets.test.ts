import WpAdminPage from '../../../pages/wp-admin-page';
import { parallelTest as test } from '../../../parallelTest';
import { BrowserContext, Page, expect } from '@playwright/test';
import EditorPage from '../../../pages/editor-page';
import EditorSelectors from '../../../selectors/editor-selectors';

test.describe( 'Atomic Widgets @v4-tests', () => {
	let editor: EditorPage;
	let wpAdmin: WpAdminPage;
	let context: BrowserContext;
	let page: Page;

	const atomicWidgets = [
		{ name: 'e-heading', title: 'Heading' },
		{ name: 'e-image', title: 'Image' },
		{ name: 'e-paragraph', title: 'Paragraph' },
		{ name: 'e-svg', title: 'SVG' },
		{ name: 'e-button', title: 'Button' },
		{ name: 'e-divider', title: 'Divider' },
		{ name: 'e-youtube', title: 'YouTube' },
	];

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		page = await context.newPage();
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( {
			e_atomic_elements: 'active',
		} );
	} );

	test.afterAll( async () => {
		await wpAdmin.resetExperiments();
		await context.close();
	} );

	test( 'Atomic elements tab UI', async () => {
		editor = await wpAdmin.openNewPage();
		await editor.openElementsPanel();

		const elementsPanel = editor.page.locator( EditorSelectors.panels.elements.elementorPanel );

		await elementsPanel.hover();
		await editor.page.mouse.wheel( 0, 300 );

		await expect.soft( editor.page.locator( EditorSelectors.panels.elements.v4elements ) ).toHaveScreenshot( 'widgets-panel.png' );
	} );

	atomicWidgets.forEach( ( widget ) => {
		test.describe( widget.name, () => {
			let containerId: string;
			let widgetId: string;
			let widgetSelector: string;

			test( 'Widget is displayed in panel', async () => {
				editor = await wpAdmin.openNewPage();
				await editor.openElementsPanel();
				const layout = editor.page.locator( EditorSelectors.panels.elements.v4elements );
				await expect( layout ).toBeVisible();
				const container = layout.locator( '.title', { hasText: widget.title } );
				await expect( container ).toBeVisible();
			} );

			test( 'Widget is displayed in canvas and frontend', async () => {
				editor = await wpAdmin.openNewPage();
				await editor.openElementsPanel();
				await test.step( 'Add widget and check editor canvas', async () => {
					containerId = await editor.addElement( { elType: 'container' }, 'document' );
					widgetId = await editor.addWidget( { widgetType: widget.name, container: containerId } );
					widgetSelector = editor.getWidgetSelector( widgetId );

					await expect( page.locator( widgetSelector ) ).toHaveScreenshot( `${ widget.name }-editor.png` );
					await expect( editor.getPreviewFrame().locator( widgetSelector ).first() ).toBeVisible();
				} );

				await test.step( 'Check frontend display', async () => {
					const containerSelector = editor.getWidgetSelector( containerId );
					await editor.publishAndViewPage();

					if ( 'e-youtube' === widget.name ) {
						await editor.isUiStable( editor.page.locator( containerSelector ) );
					}
					await expect.soft( editor.page.locator( containerSelector ) )
						.toHaveScreenshot( `${ widget.name }-published.png` );
				} );
			} );
			test( 'Widget can be removed from canvas', async () => {
				editor = await wpAdmin.openNewPage();
				await editor.openElementsPanel();

				await test.step( 'Add widget and check editor canvas', async () => {
					containerId = await editor.addElement( { elType: 'container' }, 'document' );
					widgetId = await editor.addWidget( { widgetType: widget.name, container: containerId } );
					widgetSelector = editor.getWidgetSelector( widgetId );
					await expect( editor.getPreviewFrame().locator( widgetSelector ).first() ).toBeVisible();
				} );

				await test.step( 'Remove widget from editor', async () => {
					const containerSelector = editor.getWidgetSelector( containerId );
					const containerInPreview = editor.getPreviewFrame().locator( containerSelector );
					await containerInPreview.click();
					await editor.removeElementWithHandle( containerId );

					await editor.closeNavigatorIfOpen();
					await expect.soft( editor.getPreviewFrame().locator( EditorSelectors.pageContent ) ).toHaveScreenshot( 'widget-removed-editor.png' );
				} );

				await test.step( 'Save page and check removed from UI', async () => {
					await editor.publishPage();
					await editor.viewPage();

					await expect.soft( editor.page.locator( 'body' ) ).toHaveScreenshot( 'widget-removed-frontend.png' );
				} );

				await test.step( 'Refresh page and verify widget still absent', async () => {
					await editor.page.reload();

					await expect.soft( editor.page.locator( 'body' ) ).toHaveScreenshot( 'widget-removed-after-refresh.png' );
				} );
			} );
		} );
	} );
} );
