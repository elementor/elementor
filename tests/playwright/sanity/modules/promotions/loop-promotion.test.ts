import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { expect } from '@playwright/test';
import { wpCli } from '../../../assets/wp-cli';
import { getPromotionWidgetWrapper, openPromotionPopover } from './promotion-popover-helper';

const LOOP_PROMOTION_IMAGE_URL = 'https://assets.elementor.com/packages/v1/images/Loop_grid_promotion.png';
const LOOP_PROMOTION_CONTENT_PATTERN = /connect custom layouts directly to your site database/i;
const categorySelector = '#elementor-panel-category-v4-elements';

test.describe( 'Loop promotion test @promotions', () => {
	test.beforeAll( async () => {
		await wpCli( 'wp elementor experiments activate e_atomic_elements' );
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await page.close();
	} );

	test( 'Loop widget visible in Atomic Elements with loop-widget icon', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.openNewPage();

		const category = page.locator( categorySelector );
		await category.locator( '.elementor-panel-category-title' ).click();
		await expect( category.locator( '.elementor-panel-category-items' ) ).toBeVisible();

		const loopWidgetWrapper = getPromotionWidgetWrapper( category, 'eicon-loop-widget' );
		await expect( loopWidgetWrapper ).toBeVisible();
		await expect( loopWidgetWrapper.locator( '.eicon-loop-widget' ) ).toBeVisible();
	} );

	test( 'Promotion popover shown on Loop widget click', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.openNewPage();

		const category = page.locator( categorySelector );
		await category.locator( '.elementor-panel-category-title' ).click();
		await expect( category.locator( '.elementor-panel-category-items' ) ).toBeVisible();

		const loopWidgetWrapper = getPromotionWidgetWrapper( category, 'eicon-loop-widget' );
		await expect( loopWidgetWrapper ).toBeVisible();

		const popover = await openPromotionPopover( loopWidgetWrapper );
		await expect( popover.getByText( 'Loop', { exact: true } ) ).toBeVisible();
		await expect( popover.getByText( LOOP_PROMOTION_CONTENT_PATTERN ) ).toBeVisible();
		await expect( popover.getByRole( 'link', { name: 'Upgrade now' } ) ).toHaveAttribute( 'href', /go-pro-loop-modal/ );

		const promotionImage = popover.locator( 'img' );
		await expect( promotionImage ).toHaveAttribute( 'src', LOOP_PROMOTION_IMAGE_URL );
		await expect.poll( async () => promotionImage.evaluate( ( image ) => {
			return image instanceof HTMLImageElement && image.complete && image.naturalHeight > 0;
		} ) ).toBe( true );
		await expect( popover ).toHaveScreenshot( 'loop-promotion-popover.png', {
			mask: [ promotionImage ],
		} );
	} );
} );
