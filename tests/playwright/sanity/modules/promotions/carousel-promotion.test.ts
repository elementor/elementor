import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { expect } from '@playwright/test';
import { wpCli } from '../../../assets/wp-cli';
import { getPromotionWidget, openPromotionPopover } from './promotion-popover-helper';
import _path from 'path';

const CAROUSEL_PROMOTION_CONTENT_PATTERN = /engaging slideshows with customizable slides/i;
const categorySelector = '#elementor-panel-category-v4-elements';
const carouselFixturePath = _path.resolve( __dirname, './templates/carousel-promotion.json' );

test.describe( 'Carousel promotion test @promotions', () => {
	test.describe.configure( { mode: 'serial' } );

	test.beforeAll( async () => {
		await wpCli( 'wp elementor experiments activate e_atomic_elements' );
		await wpCli( 'wp elementor experiments activate e_carousel_promotion' );
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await page.close();
	} );

	test( 'Carousel widget visible in Atomic Elements with nested-carousel icon', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.openNewPage();

		const category = page.locator( categorySelector );
		await category.locator( '.elementor-panel-category-title' ).click();
		await expect( category.locator( '.elementor-panel-category-items' ) ).toBeVisible();

		const carouselWidget = getPromotionWidget( category, 'Carousel' );
		await expect( carouselWidget ).toBeVisible();
		await expect( carouselWidget.locator( '.eicon-nested-carousel' ) ).toBeVisible();
	} );

	test( 'Promotion popover shown on Carousel widget click', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.openNewPage();

		const category = page.locator( categorySelector );
		await category.locator( '.elementor-panel-category-title' ).click();
		await expect( category.locator( '.elementor-panel-category-items' ) ).toBeVisible();

		const carouselWidget = getPromotionWidget( category, 'Carousel' );
		await expect( carouselWidget ).toBeVisible();

		const popover = await openPromotionPopover( carouselWidget );
		await expect( popover.getByText( 'Carousel', { exact: true } ) ).toBeVisible();
		await expect( popover.getByText( CAROUSEL_PROMOTION_CONTENT_PATTERN ) ).toBeVisible();
		await expect( popover.getByRole( 'link', { name: 'Upgrade now' } ) ).toHaveAttribute( 'href', /go-pro-carousel-modal/ );
	} );

	test( 'Imported carousel shows locked canvas placeholder and publishes no markup', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		await editor.loadTemplate( carouselFixturePath, false );

		const preview = editor.getPreviewFrame();
		await expect( preview.locator( '.e-pro-promotion-placeholder' ) ).toBeVisible();
		await expect( preview.getByText( 'Carousel is a Pro feature' ) ).toBeVisible();

		await editor.publishAndViewPage();

		await expect( page.locator( '.e-pro-promotion-placeholder' ) ).toHaveCount( 0 );
		await expect( page.locator( '[data-e-type="e-carousel"]' ) ).toHaveCount( 0 );
	} );

	test( 'Carousel widget hidden when carousel promotion experiment is off', async ( { page, apiRequests }, testInfo ) => {
		await wpCli( 'wp elementor experiments deactivate e_carousel_promotion' );

		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.openNewPage();

		const category = page.locator( categorySelector );
		await category.locator( '.elementor-panel-category-title' ).click();
		await expect( category.locator( '.elementor-panel-category-items' ) ).toBeVisible();

		const carouselWidget = getPromotionWidget( category, 'Carousel' );
		await expect( carouselWidget ).toHaveCount( 0 );
	} );
} );
