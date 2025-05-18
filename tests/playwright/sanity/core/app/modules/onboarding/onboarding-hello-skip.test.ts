import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../../parallelTest';
import EditorSelectors from '../../../../../selectors/editor-selectors';
import WpAdminPage from '../../../../../pages/wp-admin-page';

test.describe( 'Onboarding Skip disabled until Hello Theme loaded', async () => {
	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.activateTheme( 'twentytwentyfive' );
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.activateTheme( 'hello-elementor' );
	} );

	test( 'Onboarding Skip disabled until Hello Theme loaded', async ( { page } ) => {
		await page.goto( '/wp-admin/admin.php?page=elementor-app#onboarding/hello' );
		await page.waitForSelector( 'text=Skip' );

		const skipButton = page.locator( 'text=Skip' );

		await page.locator( EditorSelectors.onboarding.upgradeButton ).click();
		await expect( skipButton ).toHaveClass( /e-onboarding__button-skip--disabled/ );
	} );
} );
