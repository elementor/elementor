// global-setup.js
const { chromium } = require( '@playwright/test' );

module.exports = async ( config ) => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto( `${ config.projects[ 0 ].use.baseURL }/wp-admin` );

  await page.waitForSelector( 'text=Log In' );
  await page.fill( 'input[name="log"]', 'admin' );
  await page.fill( 'input[name="pwd"]', 'password' );
  await page.click( 'text=Log In' );
  await page.waitForSelector( 'text=Dashboard' );

  // Save signed-in state to 'storageState.json'.
  await page.context().storageState( { path: './tests/playwright/config/storageState.json' } );
  await browser.close();
};
