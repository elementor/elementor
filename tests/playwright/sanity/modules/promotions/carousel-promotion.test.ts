import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { expect } from '@playwright/test';
import { wpCli } from '../../../assets/wp-cli';
import { getPromotionWidget, openPromotionPopover } from './promotion-popover-helper';

const CAROUSEL_PROMOTION_CONTENT_PATTERN = /engaging slideshows with customizable slides/i;
const categorySelector = '#elementor-panel-category-v4-elements';

test.describe( 'Carousel promotion test @promotions', () => {
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

	test( 'Carousel widget hidden when carousel promotion experiment is off', async ( { page, apiRequests }, testInfo ) => {
		await wpCli( 'wp elementor experiments deactivate e_carousel_promotion' );

		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.openNewPage();

		const category = page.locator( categorySelector );
		await category.locator( '.elementor-panel-category-title' ).click();
		await expect( category.locator( '.elementor-panel-category-items' ) ).toBeVisible();

		const carouselWidget = getPromotionWidget( category, 'Carousel' );
		await expect( carouselWidget ).toHaveCount( 0 );

		await wpCli( 'wp elementor experiments activate e_carousel_promotion' );
	} );
} );
