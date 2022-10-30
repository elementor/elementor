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

  // Upload the images to WP media library
  await page.locator( '[aria-label="Add Images"]' ).click();
  await page.click( 'text=Media Library' );
  await page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/A.jpg' );
  await page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/B.jpg' );
  await page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/C.jpg' );
  await page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/D.jpg' );
  await page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/E.jpg' );

  // Create a new gallery
  await page.locator( 'text=Create a new gallery' ).click();

  // Insert gallery
  await page.locator( 'text=Insert gallery' ).click();

  // Open The Additional options Section
  await page.click( '#elementor-controls >> :nth-match(div:has-text("Additional Options"), 3)' );

  // Disable AutoPlay
  await page.selectOption( 'select', 'no' );

  expect( await editor.getPreviewFrame().locator( 'div.elementor-image-carousel-wrapper.swiper-container.swiper-container-initialized' ).screenshot( { type: 'jpeg', quality: 70 } ) ).toMatchSnapshot( 'carousel.jpeg' );

  // Reset the Default template.
  await editor.useDefaultTemplate();
} );
