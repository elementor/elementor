import { BrowserContext, expect, Page } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';

test.describe( 'Revision loading with unknown widgets @history', () => {
	let wpAdminPage: WpAdminPage;
	let context: BrowserContext;
	let page: Page;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		page = await context.newPage();
		wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );
	} );

	test.afterAll( async () => {
		await wpAdminPage?.resetExperiments();
		await context.close();
	} );

	test( 'should gracefully handle revision loading when atomic experiment is deactivated', async () => {
		await test.step( 'Ensure atomic experiment is active initially', async () => {
			await wpAdminPage.setExperiments( { e_atomic_elements: true } );
		} );

		const editor = await wpAdminPage.openNewPage();
		const pageUrl = page.url();

		await test.step( 'Create page with atomic and regular widgets', async () => {
			const containerId = await editor.addElement( { elType: 'container' }, 'document' );

			await editor.addWidget( { widgetType: 'e-heading', container: containerId } );
			await editor.addWidget( { widgetType: 'button', container: containerId } );
		} );

		await test.step( 'Publish page to create first revision with atomic widget', async () => {
			await editor.publishPage();
		} );

		await test.step( 'Modify content and publish again', async () => {
			const newContainerId = await editor.addElement( { elType: 'container' }, 'document' );
			await editor.addWidget( { widgetType: 'text-editor', container: newContainerId } );
			await editor.publishPage();
		} );

		await test.step( 'Deactivate atomic experiment', async () => {
			await wpAdminPage.setExperiments( { e_atomic_elements: false } );
		} );

		await test.step( 'Reload editor with experiment off', async () => {
			await page.goto( pageUrl );
			await wpAdminPage.waitForPanel();
			await wpAdminPage.closeAnnouncementsIfVisible();
		} );

		await test.step( 'Open revisions panel', async () => {
			await page.evaluate( () => {
				// @ts-expect-error - $e is a global variable in Elementor
				$e.route( 'panel/history/revisions' );
			} );

			await page.waitForSelector( '#elementor-panel-revisions' );
		} );

		await test.step( 'Select first revision containing atomic widget', async () => {
			const revisionTypeItems = page.locator( '.elementor-revision-item .elementor-revision-item__wrapper.revision' );
			const revisionCount = await revisionTypeItems.count();
			expect( revisionCount ).toBeGreaterThanOrEqual( 1 );

			await revisionTypeItems.first().locator( '.elementor-revision-item__details' ).click();

			await page.waitForSelector( '.elementor-revision-item-loading', { state: 'hidden', timeout: 30000 } );
		} );

		await test.step( 'Verify revision loads without breaking - Apply button is enabled', async () => {
			const applyButton = page.locator( '.e-revision-save' );
			await expect( applyButton ).toBeEnabled( { timeout: 10000 } );
		} );

		await test.step( 'Verify regular widgets still render correctly', async () => {
			const previewFrame = editor.getPreviewFrame();

			const buttonWidget = previewFrame.locator( '[data-widget_type="button.default"]' );
			await expect( buttonWidget ).toBeVisible();
		} );

		await test.step( 'Verify atomic widgets are not rendered', async () => {
			const previewFrame = editor.getPreviewFrame();
			const atomicHeading = previewFrame.locator( '[data-widget_type="e-heading.default"]' );
			await expect( atomicHeading ).toHaveCount( 0 );
		} );

		await test.step( 'Apply the revision without errors', async () => {
			await page.locator( '.e-revision-save' ).click();

			await page.waitForResponse( ( response ) =>
				response.url().includes( 'admin-ajax.php' ) && 200 === response.status(),
			);
		} );

		await test.step( 'Verify editor remains functional after applying revision', async () => {
			const previewFrame = editor.getPreviewFrame();

			const buttonWidget = previewFrame.locator( '[data-widget_type="button.default"]' );
			await expect( buttonWidget ).toBeVisible();

			const containers = previewFrame.locator( '[data-element_type="container"]' );
			await expect( containers.first() ).toBeVisible();
		} );

		await test.step( 'Reactivate atomic experiment', async () => {
			await wpAdminPage.setExperiments( { e_atomic_elements: true } );
		} );

		await test.step( 'Reload editor with experiment on', async () => {
			await page.goto( pageUrl );
			await wpAdminPage.waitForPanel();
			await wpAdminPage.closeAnnouncementsIfVisible();
		} );

		await test.step( 'Open revisions panel', async () => {
			await page.evaluate( () => {
				// @ts-expect-error - $e is a global variable in Elementor
				$e.route( 'panel/history/revisions' );
			} );

			await page.waitForSelector( '#elementor-panel-revisions' );
		} );

		await test.step( 'Select first revision containing atomic widget', async () => {
			const revisionTypeItems = page.locator( '.elementor-revision-item .elementor-revision-item__wrapper.revision' );
			const revisionCount = await revisionTypeItems.count();
			expect( revisionCount ).toBeGreaterThanOrEqual( 2 );

			await revisionTypeItems.nth( 2 ).locator( '.elementor-revision-item__details' ).click();

			await page.waitForSelector( '.elementor-revision-item-loading', { state: 'hidden', timeout: 30000 } );
		} );

		await test.step( 'Verify revision loads without breaking - Apply button is enabled', async () => {
			const applyButton = page.locator( '.e-revision-save' );
			await expect( applyButton ).toBeEnabled( { timeout: 10000 } );
		} );

		await test.step( 'Verify regular widgets still render correctly', async () => {
			const previewFrame = editor.getPreviewFrame();

			const buttonWidget = previewFrame.locator( '[data-widget_type="button.default"]' );
			await expect( buttonWidget ).toBeVisible();
		} );

		await test.step( 'Verify atomic widgets are rendered', async () => {
			const previewFrame = editor.getPreviewFrame();
			const atomicHeading = previewFrame.locator( '[data-widget_type="e-heading.default"]' );
			await expect( atomicHeading ).toHaveCount( 1 );
		} );
	} );
} );
