import { test, expect } from '@playwright/test';
import WpAdminPage from '../pages/wp-admin-page';
import ImageCarousel from '../pages/widgets/image-carousel';

test( 'Basic Gallery', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo ),
		editor = await wpAdmin.useElementorCleanPost();
	const imageCarousel = new ImageCarousel( page, testInfo );

	// Close Navigator
	await editor.closeNavigatorIfOpen();
	await editor.addWidget( 'image-gallery' );

	// Act.
	await imageCarousel.addImageGallery();

	await editor.togglePreviewMode();
	expect( await editor.getPreviewFrame()
		.locator( 'div#gallery-1' )
		.screenshot( { type: 'jpeg', quality: 90 } ) )
		.toMatchSnapshot( 'gallery.jpeg' );
} );

test( 'Basic Gallery Lightbox test with latest Swiper', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo );
	const imageCarousel = new ImageCarousel( page, testInfo );

	await wpAdmin.setExperiments( {
		e_swiper_latest: true,
	} );

	const editor = await wpAdmin.useElementorCleanPost();

	// Close Navigator
	await editor.closeNavigatorIfOpen();
	await editor.addWidget( 'image-gallery' );
	// Act.
	await testBasicSwiperGallery( editor, page, imageCarousel );

	await wpAdmin.setExperiments( {
		e_swiper_latest: false,
	} );
} );

test( 'Basic Gallery Lightbox test with older Swiper', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo );
	const imageCarousel = new ImageCarousel( page, testInfo );

	await wpAdmin.setExperiments( {
		e_swiper_latest: false,
	} );

	const editor = await wpAdmin.useElementorCleanPost();

	// Close Navigator
	await editor.closeNavigatorIfOpen();
	await editor.addWidget( 'image-gallery' );

	// Act.
	await testBasicSwiperGallery( editor, page, imageCarousel );
} );

async function testBasicSwiperGallery( editor, page, imageCarousel ) {
	// Act.
	await imageCarousel.addImageGallery();

	await editor.togglePreviewMode();
	await editor.getPreviewFrame().locator( 'div#gallery-1 img' ).first().click();
	await editor.getPreviewFrame().locator( '.elementor-swiper-button-next' ).first().click();
	await page.waitForTimeout( 500 );

	expect( await editor.getPreviewFrame().locator( '.elementor-lightbox' ).screenshot( { type: 'jpeg', quality: 100 } ) ).toMatchSnapshot( 'gallery-lightbox-swiper.jpeg' );
}
