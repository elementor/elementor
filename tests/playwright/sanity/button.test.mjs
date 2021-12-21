import { test, expect } from "@playwright/test";
import WpAdminPage from '../pages/wp-admin-page.mjs';

test( 'Button widget sanity test', async ( { page }, testInfo) => {
	const wpAdmin = new WpAdminPage( page, testInfo );

	await wpAdmin.login();

	const editor = 	await wpAdmin.createNewPage();

	await editor.addWidget( 'button' );

	const button = await editor.previewFrame.waitForSelector( 'a[role="button"]:has-text("Click here")' );

	expect( await button.innerText() ).toBe( 'Click here' );
} );
