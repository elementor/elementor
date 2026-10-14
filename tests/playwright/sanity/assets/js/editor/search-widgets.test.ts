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

	// Wait for search results to update
	await page.waitForLoadState( 'networkidle' );

	// Assert - the widget should be shown in search result.
	const widgetsInSearchResult = page.locator( '#elementor-panel-elements .elementor-element-wrapper .elementor-element' );
	await expect( widgetsInSearchResult ).toHaveCount( 1 );
} );

test( 'WordPress widgets hidden from panel should still appear in search results', async ( { page, apiRequests }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	await wpAdmin.openNewPage();

	// Act - search for a WordPress widget hidden from the panel.
	const widgetSearchBar = 'input#elementor-panel-elements-search-input';
	await page.waitForSelector( widgetSearchBar );
	await page.locator( widgetSearchBar ).fill( 'RSS' );

	// Wait for search results to update
	await page.waitForLoadState( 'networkidle' );

	// Assert - the RSS WordPress widget should appear in search even though its panel section is hidden.
	const rssWidget = page.locator( '#elementor-panel-elements .elementor-element-wrapper .elementor-element', { hasText: 'RSS' } );
	await expect( rssWidget ).toHaveCount( 1 );
} );

test( 'WordPress category should not be visible in the panel without a search term', async ( { page, apiRequests }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	await wpAdmin.openNewPage();

	// Assert - the WordPress category section should not be visible when there is no search term.
	const wordpressCategory = page.locator( '#elementor-panel-elements-wrapper [data-category="wordpress"]' );
	await expect( wordpressCategory ).toHaveCount( 0 );
} );
