const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../pages/wp-admin-page.js' );

test.only( 'Image Carousel', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo ),
		editor = await wpAdmin.useElementorCleanPost();

	// Act.
	await editor.addWidget( 'image-carousel' );
	
//await page.locator('#elementor-controls >> text=Image Carousel').click();

 // Click [aria-label="Add Images"]
  await page.locator('[aria-label="Add Images"]').click();

  // Click text=Media Library
  await page.click('text=Media Library');
  // Upload A.png, B.png, C.png, D.png, E.png
  await page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/A.jpg' );
  await page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/B.jpg' );
  await page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/C.jpg' );
  await page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/D.jpg' );
  await page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/E.jpg' );
 // Click text=Create a new gallery
  await page.locator('text=Create a new gallery').click();
  // Click text=Insert gallery
  await page.locator('text=Insert gallery').click();
} );


