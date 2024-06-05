import { test, expect } from '@playwright/test';
import WpAdminPage from '../../../../../../../pages/wp-admin-page';
import ImageCarousel from '../../../../../../../pages/widgets/image-carousel';

test( 'Image Carousel widget sanity test lazyload', async ( { page }, testInfo ) => {
	const wpAdmin = new WpAdminPage( page, testInfo ),
		editor = await wpAdmin.openNewPage();
	const imageCarousel = new ImageCarousel( page, testInfo );
	const images = [ 'elementor1.png', 'elementor2.png', 'elementor3.png', 'elementor4.png' ];

	await editor.addWidget( 'image-carousel' );
	await imageCarousel.addImageGallery( { images } );
	await imageCarousel.setAutoplay();
	await page.click( '.elementor-control-lazyload >> span' );

	// Set Image carousel settings
	await page.click( '#elementor-controls >> text=Image Carousel' );
	await editor.setSelectControlValue( 'slides_to_show', '1' );

	const widget = await editor.getPreviewFrame().waitForSelector( '.elementor-image-carousel' );
	const widgetImages = await widget.$$( '.swiper-slide >> img' );

	// The lazyload loads images from data-src into src.
	// If the src does not exist, the data-src should exist with the image src.
	for ( const image of widgetImages ) {
		const src = await image.getAttribute( 'src' );

		if ( src ) {
			expect( src ).toContain( '.png' );
		} else {
			const dataSrc = await image.getAttribute( 'data-src' );
			expect( dataSrc ).toContain( '.png' );
		}
	}
} );
