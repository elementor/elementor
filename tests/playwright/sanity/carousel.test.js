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
  // Click text=Select Files
  await page.locator('text=Select Files').click();
  // Upload A.png, B.png, C.png, D.png, E.png
  await page.locator('text=Select Files').setInputFiles(['./tests/playwright/resources/A.png', './tests/playwright/resources/B.png', './tests/playwright/resources/C.png', './tests/playwright/resources/D.png', './tests/playwright/resources/E.png']);
 
 // Click text=Create a new gallery
  await page.locator('text=Create a new gallery').click();
  // Click text=Insert gallery
  await page.locator('text=Insert gallery').click();
} );


