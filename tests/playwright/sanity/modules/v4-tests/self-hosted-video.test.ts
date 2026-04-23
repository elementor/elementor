import { BrowserContext, expect } from '@playwright/test';
import { resolve } from 'path';
import EditorPage from '../../../pages/editor-page';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';

test.describe( 'Self-Hosted Video Widget @v4-tests', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let context: BrowserContext;

	const widgetType = 'e-self-hosted-video';

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		const page = await context.newPage();
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
		const videoElement = editor.page.frameLocator( 'iframe[title="Preview"]' ).locator( 'video' );

		// Act
		await test.step( 'Upload a video file', async () => {
			editor.selectElement( widgetId );
			const videoWidget = await editor.selectElement( widgetId );
			await expect( videoWidget ).toBeVisible();
			await editor.page.getByRole( 'button', { name: 'Select video' } ).click();
			await editor.page.setInputFiles(
				'input[type="file"]',
				resolve( __dirname, '../../../resources/video.webm' ),
			);

			await editor.page.getByRole( 'button', { name: 'Select', exact: true } ).click();
			await expect( videoElement ).toBeVisible();
		} );

		await test.step( 'Autoplay', async () => {
			await expect( videoElement ).not.toHaveAttribute( 'autoplay' );
			await expect( videoElement ).not.toHaveAttribute( 'playsinline' );
			await expect( editor.page.locator( 'span' ).filter( { hasText: 'Play on mobile' } ) ).toBeHidden();
			await editor.page.locator( 'span' ).filter( { hasText: 'Autoplay' } ).getByRole( 'checkbox' ).click();
			await expect( videoElement ).toHaveAttribute( 'autoplay', '' );
			await editor.page.locator( 'span' ).filter( { hasText: 'Play on mobile' } ).getByRole( 'checkbox' ).click();
			await expect( videoElement ).toHaveAttribute( 'playsinline' );
		} );

		await test.step( 'Controls', async () => {
			await expect( videoElement ).toHaveAttribute( 'preload', 'metadata' );
			await expect( videoElement ).toHaveAttribute( 'controls', '' );
			await expect( videoElement ).toHaveAttribute( 'controlslist', 'nodownload' );
			await editor.v4Panel.openTab( 'general' );
			await editor.page.locator( 'span' ).filter( { hasText: 'Player Controls' } ).getByRole( 'checkbox' ).click();
			await expect( videoElement ).not.toHaveAttribute( 'controls' );
			await editor.page.locator( 'span' ).filter( { hasText: 'Player Controls' } ).getByRole( 'checkbox' ).click();
			await editor.page.locator( 'span' ).filter( { hasText: 'Allow Download' } ).waitFor();
			await editor.page.locator( 'span' ).filter( { hasText: 'Allow Download' } ).getByRole( 'checkbox' ).click();

			await expect( videoElement ).toHaveAttribute( 'controls', '' );
			await expect( videoElement ).not.toHaveAttribute( 'controlslist' );
		} );
	} );
} );
