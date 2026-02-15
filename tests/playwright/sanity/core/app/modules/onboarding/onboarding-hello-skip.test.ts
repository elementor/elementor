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

		const upgradeButton = page.locator( EditorSelectors.onboarding.upgradeButton );
		const themeSelectionCard = page.locator( '[data-theme="hello-biz"]' );
		const hasThemeSelectionCard = await themeSelectionCard.count() > 0;

		if ( hasThemeSelectionCard && await upgradeButton.evaluate( ( el ) => el.hasAttribute( 'disabled' ) ) ) {
			await themeSelectionCard.click();
			await expect( upgradeButton ).not.toHaveClass( /e-onboarding__button--disabled/ );
		}

		await upgradeButton.click();
		await expect( page.locator( EditorSelectors.onboarding.skipButton ) ).toHaveClass( /e-onboarding__button-skip--disabled/ );
	} );
} );
