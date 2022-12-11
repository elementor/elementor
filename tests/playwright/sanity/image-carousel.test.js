const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../pages/wp-admin-page.js' );

test( 'Image Carousel', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo ),
		editor = await wpAdmin.useElementorCleanPost();

  // Close Navigator
  await editor.closeNavigatorIfOpen();

  // Set Canvas template.
  await editor.useCanvasTemplate();

  // Act.
  await editor.addWidget( 'image-carousel' );

  // Hide slider navigation.
  await page.selectOption( '.elementor-control-navigation >> select', 'none' );

  // Populate the widget with images.
  await editor.populateImageCarousel();

  expect( await editor.getPreviewFrame().locator( 'div.elementor-image-carousel-wrapper.swiper-container.swiper-container-initialized' ).screenshot( { type: 'jpeg', quality: 70 } ) ).toMatchSnapshot( 'carousel.jpeg' );

  // Reset the Default template.
  await editor.useDefaultTemplate();
} );
