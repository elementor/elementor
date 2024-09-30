import { expect } from '@playwright/test';
import { parallelTest as test } from '../parallelTest';
import WpAdminPage from '../pages/wp-admin-page';
import EditorPage from '../pages/editor-page';

test( 'Basic Gallery', async ( { page, apiRequests }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
		editor = await wpAdmin.openNewPage();

	await editor.closeNavigatorIfOpen();
	await editor.addWidget( 'image-gallery' );

	// Act.
	await editor.openPanelTab( 'content' );
	await editor.addImagesToGalleryControl();

	await editor.togglePreviewMode();
	expect( await editor.getPreviewFrame()
		.locator( 'div#gallery-1' )
		.screenshot( { type: 'jpeg', quality: 90 } ) )
		.toMatchSnapshot( 'gallery.jpeg' );
} );

test( 'Basic Gallery Lightbox test with latest Swiper', async ( { page, apiRequests }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

	await wpAdmin.setExperiments( {
		e_swiper_latest: true,
	} );

	const editor = await wpAdmin.openNewPage();

	await editor.closeNavigatorIfOpen();
	await editor.addWidget( 'image-gallery' );

	// Act.
	await testBasicSwiperGallery( editor );

	await wpAdmin.setExperiments( {
		e_swiper_latest: false,
	} );
} );

test( 'Basic Gallery Lightbox test with older Swiper', async ( { page, apiRequests }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

	await wpAdmin.setExperiments( {
		e_swiper_latest: false,
	} );

	const editor = await wpAdmin.openNewPage();

	await editor.closeNavigatorIfOpen();
	await editor.addWidget( 'image-gallery' );

	// Act.
	await testBasicSwiperGallery( editor );
} );

async function testBasicSwiperGallery( editor: EditorPage ) {
	// Act.
	await editor.openPanelTab( 'content' );
	await editor.addImagesToGalleryControl();

	await editor.togglePreviewMode();
	await editor.getPreviewFrame().locator( 'div#gallery-1 img' ).first().click();
	await editor.page.waitForTimeout( 1000 );
	await editor.getPreviewFrame().locator( '.swiper-slide-active img[data-title="A"]' ).waitFor();
	await editor.getPreviewFrame().locator( '.elementor-swiper-button-next' ).first().click();
	await editor.getPreviewFrame().locator( '.swiper-slide-active img[data-title="B"]' ).waitFor();

	await expect( editor.getPreviewFrame().locator( '.elementor-lightbox' ) )
		.toHaveScreenshot( 'gallery-lightbox-swiper.png' );
}
