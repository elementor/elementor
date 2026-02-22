import { BrowserContext, expect, Page } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';

test.describe( 'Self-Hosted Video Widget @v4-tests', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let context: BrowserContext;
	let page: Page;

	const widgetType = 'e-self-hosted-video';

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

	test.beforeEach( async () => {
		editor = await wpAdmin.openNewPage();
	} );

	test( 'Self hosted video widget', async () => {
		// Arrange
		let widgetId = '';
		await test.step( 'Add widget and check editor canvas', async () => {
			const containerId = await editor.addElement( { elType: 'container' }, 'document' );
			widgetId = await editor.addWidget( { widgetType, container: containerId } );
		} );

		// Act
		await test.step( 'Choose a video file', async () => {
			editor.selectElement( widgetId );
			const videoWidget = await editor.selectElement( widgetId );
			expect( videoWidget ).toBeVisible();
			await page.getByRole( 'button', { name: 'Select video' } ).click();
			await page.getByRole( 'checkbox', { name: 'video', exact: true } ).click();
			await page.getByRole( 'button', { name: 'Select', exact: true } ).click();
			await page.waitForTimeout( 500 );
			const videoElement = page.locator( 'iframe[title="Preview"]' ).contentFrame().locator( 'video' );
			expect( videoElement ).toBeVisible();
		} );

		await test.step( 'Autoplay', async () => {
			const videoElement = page.locator( 'iframe[title="Preview"]' ).contentFrame().locator( 'video' );
			expect( videoElement ).not.toHaveAttribute( 'autoplay' );
			expect( videoElement ).not.toHaveAttribute( 'playsinline' );
			await expect( page.locator( 'span' ).filter( { hasText: 'Play on mobile' } ) ).not.toBeVisible();
			await page.locator( 'span' ).filter( { hasText: 'Autoplay' } ).getByRole( 'checkbox' ).click();
			await expect( videoElement ).toHaveAttribute( 'autoplay', '' );
			await page.locator( 'span' ).filter( { hasText: 'Play on mobile' } ).getByRole( 'checkbox' ).click();
			expect( videoElement ).not.toHaveAttribute( 'playsinline' );
		} );

		await test.step( 'Controls', async () => {
			const videoElement = page.locator( 'iframe[title="Preview"]' ).contentFrame().locator( 'video' );
			await expect( videoElement ).toHaveAttribute( 'preload', 'metadata' );
			await expect( videoElement ).toHaveAttribute( 'controls', '' );
			await expect( videoElement ).toHaveAttribute( 'controlslist', 'nodownload' );
			await editor.v4Panel.openTab( 'general' );
			await page.locator( 'span' ).filter( { hasText: 'Player Controls' } ).getByRole( 'checkbox' ).click();
			await expect( videoElement ).not.toHaveAttribute( 'controls' );
			await page.locator( 'span' ).filter( { hasText: 'Player Controls' } ).getByRole( 'checkbox' ).click();
			await page.locator( 'span' ).filter( { hasText: 'Allow Download' } ).waitFor();
			await page.locator( 'span' ).filter( { hasText: 'Allow Download' } ).getByRole( 'checkbox' ).click();
			await page.waitForTimeout( 300 );
			expect( videoElement ).toHaveAttribute( 'controls', '' );
			expect( videoElement ).not.toHaveAttribute( 'controlslist' );
		} );
	} );
} );
