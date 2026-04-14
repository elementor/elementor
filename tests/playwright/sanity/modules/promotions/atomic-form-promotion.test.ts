import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { expect } from '@playwright/test';
import { wpCli } from '../../../assets/wp-cli';

test.describe( 'Atomic Form promotion test @promotions', () => {
	const categorySelector = '#elementor-panel-category-atomic-form';
	const promotionLinkSelector = `${ categorySelector } .elementor-panel-heading-promotion a`;

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

	test( 'Upgrade button visible on Atomic Form section', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.openNewPage();

		const category = page.locator( categorySelector );
		await expect( category ).toBeVisible();

		const promotionLink = page.locator( promotionLinkSelector );
		await expect( promotionLink ).toBeVisible();
		await expect( promotionLink ).toHaveAttribute( 'href', /go-pro-atomic-form-section/ );
	} );

	test.only( 'Promotion popover shown on widget click', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.openNewPage();

		const category = page.locator( categorySelector );
		await category.locator( '.elementor-panel-category-title' ).click();
		await expect( category.locator( '.elementor-panel-category-items' ) ).toBeVisible();

		const formWidget = category.locator( '.elementor-element' ).filter( { hasText: 'Form' } ).first();
		await formWidget.click( { force: true } );

		const popover = page.locator( '.MuiTooltip-popper' );
		await expect( popover ).toBeVisible();
		await expect( popover.getByText( 'Atomic form' ) ).toBeVisible();
		await expect( popover.getByRole( 'button', { name: 'Upgrade now' } ) ).toBeVisible();

		await expect( popover ).toHaveScreenshot( 'atomic-form-promotion-popover.png' );
	} );
} );
