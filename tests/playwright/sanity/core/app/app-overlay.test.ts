import { expect, type Page } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { timeouts } from '../../../config/timeouts';

const ADMIN_BAR = '#wpadminbar';
const ADMIN_BAR_EDIT_MENU = '#wp-admin-bar-elementor_edit_page';
const ADMIN_BAR_THEME_BUILDER_LINK = '#wp-admin-bar-elementor_app_site_editor > a';
const APP_IFRAME = 'iframe.elementor-app-iframe';
const APP_BACKDROP = '.elementor-app-backdrop';
const THEME_BUILDER_HEADING = 'Theme Builder';
const MIN_VIEWPORT_COVERAGE_RATIO = 0.8;
const BACKDROP_EDGE_OFFSET_PX = 1;

async function openThemeBuilderFromFrontendAdminBar( page: Page ): Promise<void> {
	await page.locator( ADMIN_BAR_EDIT_MENU ).hover();
	await page.locator( ADMIN_BAR_THEME_BUILDER_LINK ).click();
	await expect( page.frameLocator( APP_IFRAME ).getByText( THEME_BUILDER_HEADING, { exact: true } ) )
		.toBeVisible( { timeout: timeouts.heavyAction } );
}

test.describe( 'Elementor App overlay - frontend admin bar @app-overlay', () => {
	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.showAdminBar();
		const editor = await wpAdmin.openNewPage();
		await editor.publishAndViewPage();
	} );

	test( 'Theme Builder opens as a fixed overlay covering the viewport', async ( { page } ) => {
		// Arrange
		const viewport = page.viewportSize();
		const iframe = page.locator( APP_IFRAME );

		// Act
		await openThemeBuilderFromFrontendAdminBar( page );

		// Assert
		await expect( iframe ).toHaveCSS( 'position', 'fixed' );
		const box = await iframe.boundingBox();
		expect( box ).not.toBeNull();
		expect( box.width ).toBeGreaterThanOrEqual( viewport.width * MIN_VIEWPORT_COVERAGE_RATIO );
		expect( box.height ).toBeGreaterThanOrEqual( viewport.height * MIN_VIEWPORT_COVERAGE_RATIO );
	} );

	test( 'Theme Builder overlay is rendered above the WordPress admin bar', async ( { page } ) => {
		// Arrange
		const iframe = page.locator( APP_IFRAME );

		// Act
		await openThemeBuilderFromFrontendAdminBar( page );

		// Assert
		const [ iframeZIndex, adminBarZIndex ] = await Promise.all( [
			iframe.evaluate( ( element ) => Number( getComputedStyle( element ).zIndex ) ),
			page.locator( ADMIN_BAR ).evaluate( ( element ) => Number( getComputedStyle( element ).zIndex ) ),
		] );
		expect( iframeZIndex ).toBeGreaterThan( adminBarZIndex );
	} );

	test( 'Clicking the backdrop closes the Theme Builder overlay', async ( { page } ) => {
		// Arrange
		await openThemeBuilderFromFrontendAdminBar( page );
		const backdrop = page.locator( APP_BACKDROP );
		await expect( backdrop ).toHaveCSS( 'position', 'fixed' );

		// Act
		await backdrop.click( {
			position: {
				x: BACKDROP_EDGE_OFFSET_PX,
				y: page.viewportSize().height - BACKDROP_EDGE_OFFSET_PX,
			},
		} );

		// Assert
		await expect( page.locator( APP_IFRAME ) ).toHaveCount( 0 );
		await expect( backdrop ).toHaveCount( 0 );
		await expect( page.locator( 'body' ) ).not.toHaveCSS( 'overflow', 'hidden' );
	} );
} );
