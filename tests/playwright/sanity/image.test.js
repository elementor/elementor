const { test, expect } = require( '@playwright/test' );
const { editorPage } = require( '../pages/editor-page' );
const { wpAdminPage } = require( '../pages/wp-admin-page' );

test( 'Image widget sanity test', async ( { page } ) => {
  const wpAdmin = new wpAdminPage( page );
  await wpAdmin.createNewPage();

  const editor = new editorPage( page );
  await editor.addWidgitByName( 'image' );

  await page.click( '.elementor-control-media__preview' );
  await page.click( 'text=Media Library' );
  await page.waitForSelector( 'text=Insert Media' );
  await page.waitForTimeout( 1000 );

  // Check if previous image is already uploaded
  const previousImage = await page.$( '[aria-label="mountain-image"], li[tabindex="0"]' );
  if ( previousImage ) {
    await page.click( '[aria-label="mountain-image"], li[tabindex="0"]' );
  } else {
    await page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/mountain-image.jpeg' );
    await page.waitForSelector( 'text=Showing 1 of 1 media items' );
  }

  await page.click( '.button.media-button' );
  const img = await editor.previewFrame.waitForSelector( 'img' );
  const src = await img.getAttribute( 'src' );
  expect( src ).toContain( '.jpeg' );
} );
