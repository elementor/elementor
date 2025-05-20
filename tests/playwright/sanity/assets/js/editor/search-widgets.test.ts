import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';

test( 'Visible widgets should be shown in search result', async ( { page, apiRequests }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	await wpAdmin.openNewPage();

	// Act - search for a visible widget.
	const widgetSearchBar = 'input#elementor-panel-elements-search-input';
	await page.waitForSelector( widgetSearchBar );
	await page.locator( widgetSearchBar ).fill( 'Spacer' );

	// Assert - the widget should be shown in search result.
	const widgetsInSearchResult = page.locator( '#elementor-panel-elements .elementor-element-wrapper .elementor-element' );
	expect( widgetsInSearchResult ).toHaveCount( 1 );
} );

test( 'Hidden widgets should not be shown in search result', async ( { page, apiRequests }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	await wpAdmin.openNewPage();

	// Act - search for a hidden widget.
	const widgetSearchBar = 'input#elementor-panel-elements-search-input';
	await page.waitForSelector( widgetSearchBar );
	await page.locator( widgetSearchBar ).fill( 'RSS' );

	// Assert - the widget should not be shown in search result.
	const widgetsInSearchResult = page.locator( '#elementor-panel-elements .elementor-element-wrapper .elementor-element' );
	expect( widgetsInSearchResult ).toHaveCount( 0 );
} );
