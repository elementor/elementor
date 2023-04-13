const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../pages/wp-admin-page.js' );

test( 'Basic Gallery', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo ),
		editor = await wpAdmin.useElementorCleanPost();

	// Close Navigator
	await editor.closeNavigatorIfOpen();

	// Act.
	await insertImageGalleryWidget( editor, page );

	await editor.togglePreviewMode();
	expect( await editor.getPreviewFrame().locator( 'div#gallery-1' ).screenshot( { type: 'jpeg', quality: 90 } ) ).toMatchSnapshot( 'gallery.jpeg' );
} );

test( 'Basic Gallery Lightbox test with latest Swiper', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo );

	await wpAdmin.setExperiments( {
		e_swiper_latest: true,
	} );

	const editor = await wpAdmin.useElementorCleanPost();

	// Close Navigator
	await editor.closeNavigatorIfOpen();

	// Act.
	await testBasicSwiperGallery( editor, page );

	await wpAdmin.setExperiments( {
		e_swiper_latest: false,
	} );
} );

test( 'Basic Gallery Lightbox test with older Swiper', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo );

	await wpAdmin.setExperiments( {
		e_swiper_latest: false,
	} );

	const editor = await wpAdmin.useElementorCleanPost();

	// Close Navigator
	await editor.closeNavigatorIfOpen();

	// Act.
	await testBasicSwiperGallery( editor, page );
} );

async function insertImageGalleryWidget( editor, page ) {
	await editor.addWidget( 'image-gallery' );

	await page.locator( '.elementor-control-gallery-add' ).click();

	// Open Media Library
	await page.click( 'text=Media Library' );

	// Upload the images to WP media library
	await page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/A.jpg' );
	await page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/B.jpg' );
	await page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/C.jpg' );
	await page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/D.jpg' );
	await page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/E.jpg' );

	// Create a new gallery
	await page.locator( 'text=Create a new gallery' ).click();

	// Insert gallery
	await page.locator( 'text=Insert gallery' ).click();
}

async function testBasicSwiperGallery( editor, page ) {
	// Act.
	await insertImageGalleryWidget( editor, page );

	await editor.togglePreviewMode();
	await editor.getPreviewFrame().locator( 'div#gallery-1 img' ).first().click();
	await editor.getPreviewFrame().locator( '.elementor-swiper-button-next' ).first().click();
	await page.waitForTimeout( 500 );

	expect( await editor.getPreviewFrame().locator( '.elementor-lightbox' ).screenshot( { type: 'jpeg', quality: 100 } ) ).toMatchSnapshot( 'gallery-lightbox-swiper.jpeg' );
}
