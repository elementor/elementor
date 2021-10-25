const { test, expect } = require( '@playwright/test' );
const { editorPage } = require( '../pages/editor-page' );
const { wpAdminPage } = require( '../pages/wp-admin-page' );

test( 'Button widget sanity test', async ( { page } ) => {
  const wpAdmin = new wpAdminPage( page );
  await wpAdmin.createNewPage();

  const editor = new editorPage( page );
  await editor.addWidgitByName( 'button' );
  const button = await editor.previewFrame.waitForSelector( 'a[role="button"]:has-text("Click here")' );
  expect( await button.innerText() ).toBe( 'Click here' );
} );
