import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../../../../parallelTest';
import WpAdminPage from '../../../../../../../pages/wp-admin-page';

test.describe( `$e.run( 'editor/elements/views/widget' )`, () => {
	test( 'Check if the empty placeholder is displayed inside the Image Carousel', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			editor = await wpAdmin.openNewPage();

		// Act.
		await editor.addWidget( 'image-carousel' );
		await page.waitForTimeout( 500 );
		await editor.getPreviewFrame().waitForSelector( '.elementor-widget-image-carousel .elementor-widget-empty-icon' );

		const emptyViewPlaceholderCount = await editor.getPreviewFrame().evaluate( () => document.querySelectorAll( '.elementor-widget-image-carousel .elementor-widget-empty-icon' ).length );

		// Assert.
		expect( emptyViewPlaceholderCount ).toBe( 1 );
	} );

	test( 'Check if the empty placeholder is displayed inside the Sidebar widget', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			editor = await wpAdmin.openNewPage();

		// Act.
		await editor.addWidget( 'sidebar' );
		await editor.closeNavigatorIfOpen();
		await page.waitForTimeout( 500 );
		await editor.getPreviewFrame().waitForSelector( '.elementor-widget .elementor-widget-empty-icon' );

		const emptyViewPlaceholderCount = await editor.getPreviewFrame().locator( '.elementor-widget-sidebar .elementor-widget-empty-icon' ).count();

		// Assert.
		expect( emptyViewPlaceholderCount ).toBe( 1 );
	} );

	test( 'Check if the empty placeholder is displayed inside the Image Box widget', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			editor = await wpAdmin.openNewPage();

		// Act.
		await editor.addWidget( 'image-box' );
		await page.hover( '.elementor-control-image .elementor-control-media__content' );
		await page.hover( '.elementor-control-media-area' );
		await page.click( '.elementor-control-media__remove' );
		await editor.setTextControlValue( 'title_text', '' );
		await editor.setTextareaControlValue( 'description_text', '' );
		await page.waitForTimeout( 500 );
		await editor.getPreviewFrame().waitForSelector( '.elementor-widget .elementor-widget-empty-icon' );

		const emptyViewPlaceholderCount = await editor.getPreviewFrame().locator( '.elementor-widget-image-box > .elementor-widget-empty-icon.eicon-image-box' ).count();

		// Assert.
		expect( emptyViewPlaceholderCount ).toBe( 1 );
	} );

	test( 'Check if the empty placeholder is displayed inside the Basic Gallery widget', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			editor = await wpAdmin.openNewPage();

		// Act.
		await editor.addWidget( 'image-gallery' );
		await page.waitForTimeout( 500 );
		await editor.getPreviewFrame().waitForSelector( '.elementor-widget-image-gallery .elementor-widget-empty-icon' );

		const emptyViewPlaceholderCount = await editor.getPreviewFrame().evaluate( () => document.querySelectorAll( '.elementor-widget-image-gallery .elementor-widget-empty-icon' ).length );

		// Assert.
		expect( emptyViewPlaceholderCount ).toBe( 1 );
	} );

	test( 'Check if the empty placeholder is displayed inside the Video widget', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			editor = await wpAdmin.openNewPage();

		// Act.
		await editor.addWidget( 'video' );
		await editor.setSelectControlValue( 'video_type', 'hosted' );
		await page.waitForTimeout( 500 );
		await editor.getPreviewFrame().waitForSelector( '.elementor-widget .elementor-widget-empty-icon' );

		const emptyViewPlaceholderCount = await editor.getPreviewFrame().locator( '.elementor-widget-video .elementor-widget-empty-icon' ).count();

		// Assert.
		expect( emptyViewPlaceholderCount ).toBe( 1 );
	} );

	test.skip( 'Check if the empty placeholder is displayed inside the Google Maps widget', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			editor = await wpAdmin.openNewPage();

		// Act.
		await editor.addWidget( 'google_maps' );
		await editor.setTextControlValue( 'address', '' );
		await editor.page.waitForLoadState( 'domcontentloaded' );
		await page.waitForTimeout( 500 );
		await editor.getPreviewFrame().waitForSelector( '.elementor-widget .elementor-widget-empty-icon' );

		const emptyViewPlaceholderCount = await editor.getPreviewFrame().locator( '.elementor-widget-google_maps .elementor-widget-empty-icon' ).count();

		// Assert.
		expect( emptyViewPlaceholderCount ).toBe( 1 );
	} );
} );
