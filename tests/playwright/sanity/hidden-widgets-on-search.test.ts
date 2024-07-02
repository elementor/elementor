import { expect } from '@playwright/test';
import { parallelTest as test } from '../parallelTest';
import WpAdminPage from '../pages/wp-admin-page';

// When searching for a widget that is not hidden on search, the widget should be shown in search result.
test( 'Spacer widget should be shown in search result', async ( { page, apiRequests }, testInfo ) => {
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	await wpAdmin.openNewPage();

	await page.waitForSelector( '.elementor-panel-category-items .eicon-t-letter' );

	// Fill [placeholder="Search Widget..."]
	await page.fill( '[placeholder="Search Widget..."]', 'Spacer' );

	const widgetsInSearchResult = await page.$$( '#elementor-panel-elements .elementor-element-wrapper .elementor-element' );

	expect( widgetsInSearchResult.length ).toEqual( 1 );
} );

// When searching for a widget that is hidden on search, the widget should not be shown in search result.
test( 'Wordpress widget should not be shown in search result', async ( { page, apiRequests }, testInfo ) => {
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	await wpAdmin.openNewPage();

	// Click text=WordPress
	await page.click( 'text=WordPress' );

	await page.waitForSelector( 'text=RSS' );

	// Fill [placeholder="Search Widget..."]
	await page.fill( '[placeholder="Search Widget..."]', 'RSS' );

	const widgetsInSearchResult = await page.$$( '#elementor-panel-elements .elementor-element-wrapper .elementor-element' );

	expect( widgetsInSearchResult.length ).toEqual( 0 );
} );
