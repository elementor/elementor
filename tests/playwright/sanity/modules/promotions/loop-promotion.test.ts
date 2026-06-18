import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { expect } from '@playwright/test';
import { wpCli } from '../../../assets/wp-cli';

const LOOP_PROMOTION_IMAGE_URL = 'https://assets.elementor.com/packages/v1/images/Loop_grid_promotion.png';
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

		const loopWidget = category.locator( '.elementor-element' ).filter( { hasText: 'Loop' } ).first();
		await expect( loopWidget ).toBeVisible();
		await expect( loopWidget.locator( '.eicon-loop-widget' ) ).toBeVisible();
	} );

	test( 'Promotion popover shown on Loop widget click', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.openNewPage();

		const category = page.locator( categorySelector );
		await category.locator( '.elementor-panel-category-title' ).click();
		await expect( category.locator( '.elementor-panel-category-items' ) ).toBeVisible();

		const loopWidget = category.locator( '.elementor-element' ).filter( { hasText: 'Loop' } ).first();
		await loopWidget.click( { force: true } );

		const popover = page.locator( '.MuiTooltip-tooltip > .MuiBox-root' );
		await expect( popover ).toBeVisible();
		await expect( popover.getByText( 'Loop' ) ).toBeVisible();
		await expect( popover.getByRole( 'link', { name: 'Upgrade now' } ) ).toHaveAttribute( 'href', /go-pro-loop-modal/ );
		await expect( popover.locator( 'img' ) ).toHaveAttribute( 'src', LOOP_PROMOTION_IMAGE_URL );
	} );
} );
