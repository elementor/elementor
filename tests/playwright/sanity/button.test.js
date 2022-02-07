const { test, expect } = require( '@playwright/test' );
const { EditorPage } = require( '../pages/editor-page' );
const { WpAdminPage } = require( '../pages/wp-admin-page' );

test( 'Button widget sanity test', async ( { page } ) => {
	const wpAdmin = new WpAdminPage( page );
	await wpAdmin.createNewPage();

	const editor = new EditorPage( page );
	await editor.addWidget( 'button' );
	const button = await editor.getFrame().waitForSelector( 'a[role="button"]:has-text("Click here")' );
	expect( await button.innerText() ).toBe( 'Click here' );
} );
