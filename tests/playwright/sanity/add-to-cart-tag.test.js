const { test, expect } = require( '@playwright/test' );
const { EditorPage } = require( '../pages/editor-page' );
const { WpAdminPage } = require( '../pages/wp-admin-page' );

test.only( 'Add to cart tag sanity test', async ( { page } ) => {
	const siteUrl = 'http://localhost/wordpress/';
	const wpAdmin = new WpAdminPage( page );

	await wpAdmin.login();

	await wpAdmin.createNewPage();

	const editor = new EditorPage( page );
	await editor.ensurePanelLoaded();

	await editor.addWidget( 'hotspot' );

	// Click #elementor-controls >> text=Hotspot
	await page.click( '#elementor-controls >> text=Hotspot' );

	// Click text=Item #1
	await page.click( 'text=Item #1' );

	// Click .elementor-control-url-more
	await page.click( '.elementor-control-url-more' );

	// Click text=Link Open in new window Add nofollow Custom Attributes Set custom attributes for >> :nth-match(i, 3)
	await page.click( 'text=Link Open in new window Add nofollow Custom Attributes Set custom attributes for >> :nth-match(i, 3)' );
	// Click text=Custom Add To Cart
	await page.click( 'text=Custom Add To Cart' );
	// Click #e997988 i
	await page.click( '.elementor-control-hotspot_link .eicon-wrench' );
	// Click span[role="textbox"]:has-text("All")
	await page.click( 'span[role="textbox"]:has-text("All")' );
	// Click input[role="textbox"]
	await page.click( 'input[role="textbox"]' );
	// Fill input[role="textbox"]
	await page.fill( 'input[role="textbox"]', 'b' );
	// Click text=Beanie with Logo
	await page.click( 'text=Beanie with Logo' );

	// Click button:has-text("Publish")
	await page.click( 'button:has-text("Publish")' );
	// Click text=Have a look
	const [ page1 ] = await Promise.all( [
		page.waitForEvent( 'popup' ),
		page.click( 'text=Have a look' ),
	] );

	await page1.waitForSelector( '.e-hotspot--circle' );

	await page1.waitForTimeout( 1000 );

	const hrefElement = await page1.$( '.e-hotspot' );

	// Subscribe to 'request' and 'response' events.
	page1.on( 'requestfinished', async ( response ) => {
		expect( response.url() ).toBe( 'http://localhost/wordpress?add-to-cart=4511&quantity=1' );
	} );

	await hrefElement.click();
} );
