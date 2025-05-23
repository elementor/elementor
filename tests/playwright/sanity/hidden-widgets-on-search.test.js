const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../pages/wp-admin-page' );

// When searching for a widget that is not hidden on search, the widget should be shown in search result.
test( 'Spacer widget should be shown in search result', async ( { page }, testInfo ) => {
	const wpAdmin = new WpAdminPage( page, testInfo );
	await wpAdmin.useElementorCleanPost();

	await page.waitForSelector( '.elementor-panel-category-items .eicon-t-letter' );

	// Fill [placeholder="Search Widget..."]
	await page.fill( '[placeholder="Search Widget..."]', 'Spacer' );

	const widgetsInSearchResult = await page.$$( '#elementor-panel-elements .elementor-element-wrapper .elementor-element' );

	expect( widgetsInSearchResult.length ).toEqual( 1 );
} );

// When searching for a widget that is hidden on search, the widget should not be shown in search result.
test( 'Wordpress widget should not be shown in search result', async ( { page }, testInfo ) => {
	const wpAdmin = new WpAdminPage( page, testInfo );
	await wpAdmin.useElementorCleanPost();

	// Click text=WordPress
	await page.click( 'text=WordPress' );

	await page.waitForSelector( 'text=RSS' );

	// Fill [placeholder="Search Widget..."]
	await page.fill( '[placeholder="Search Widget..."]', 'RSS' );

	const widgetsInSearchResult = await page.$$( '#elementor-panel-elements .elementor-element-wrapper .elementor-element' );

	expect( widgetsInSearchResult.length ).toEqual( 0 );
} );
