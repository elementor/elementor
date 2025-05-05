import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';

test.describe( 'Column tests @column', () => {
	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( {
			container: false,
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

	test( 'Section Background slideshow', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		const sectionId = await editor.addElement( { elType: 'section' }, 'document' );
		const columnId = await editor.addElement( { elType: 'column' }, sectionId );
		await editor.addWidget( 'heading', columnId );
		await editor.selectElement( columnId );

		await editor.closeNavigatorIfOpen();
		await editor.openPanelTab( 'style' );
		await editor.openSection( 'section_background' );
		await editor.setChooseControlValue( 'background_background', 'eicon-slideshow' );
		await editor.addImagesToGalleryControl();

		await test.step( 'Verify background slideshow', async () => {
			await editor.togglePreviewMode();
			const slideshow = editor
				.getPreviewFrame()
				.locator( '.elementor-column .elementor-background-slideshow' );
			await expect.soft( slideshow ).toHaveScreenshot( 'editor-section-background-slideshow.png' );
			await editor.togglePreviewMode();
			await editor.publishAndViewPage();
		} );

		await test.step( 'Verify background slideshow on the frontend', async () => {
			await expect.soft( page.locator( '.elementor-column .elementor-background-slideshow' ) ).toHaveScreenshot( 'frontend-section-background-slideshow.png' );
		} );
	} );
} );
