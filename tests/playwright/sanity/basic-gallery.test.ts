import { expect } from '@playwright/test';
import { parallelTest as test } from '../parallelTest';
import WpAdminPage from '../pages/wp-admin-page';
import EditorPage from '../pages/editor-page';
import Breakpoints from '../assets/breakpoints';
import { viewportSize } from '../enums/viewport-sizes';

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

test( 'Basic Gallery Lightbox', async ( { page, apiRequests }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	const editor = await wpAdmin.openNewPage();

	await editor.closeNavigatorIfOpen();
	await editor.addWidget( 'image-gallery' );

	// Act.
	await testBasicSwiperGallery( editor );
} );

test( 'Basic Gallery Lightbox test with breakpoints', async ( { page, apiRequests }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	const editor = await wpAdmin.openNewPage();
	const breakpoints = new Breakpoints( page );

	await editor.closeNavigatorIfOpen();

	await editor.addWidget( 'image-gallery' );
	await editor.openPanelTab( 'content' );
	await editor.addImagesToGalleryControl();
	await editor.setSelectControlValue( 'open_lightbox', 'yes' );

	await editor.publishPage();

	await breakpoints.setBreakpoint( editor, 'mobile', viewportSize.mobile.width - 50 );

	// Act.
	await editor.viewPage();
	await page.setViewportSize( viewportSize.mobile );
	await page.locator( 'div#gallery-1 img' ).first().click();
	await editor.page.waitForTimeout( 1000 );

	// Assert.
	await expect( page.locator( '.elementor-lightbox-item.swiper-slide-active' ) ).toHaveScreenshot( 'gallery-lightbox-breakpoint.png' );
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
