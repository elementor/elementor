import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { timeouts } from '../../../config/timeouts';

test.describe( 'Editor One Menu Visual Tests', () => {
	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		test.setTimeout( timeouts.singleTest );
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setSiteLanguage( '' );
		await context.close();
	} );

	test( 'Editor One full page screenshot - Hebrew', async ( { page, apiRequests }, testInfo ) => {
		test.setTimeout( timeouts.singleTest );
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdmin.setSiteLanguage( 'he_IL' );

		const translationButton = 'Form[name=upgrade-translations] input[type=submit]';
		await page.goto( '/wp-admin/update-core.php' );
		await page.locator( '.update-last-checked' ).click();
		if ( await page.locator( translationButton ).isVisible() ) {
			await page.locator( translationButton ).click();
			await page.waitForLoadState( 'networkidle' );
		}

		await page.goto( '/wp-admin/admin.php?page=elementor', {
			timeout: timeouts.singleTest,
			waitUntil: 'domcontentloaded',
		} );

		await wpAdmin.cleanAdminPageForScreenshot();

		const sidebar = page.locator( '#editor-one-sidebar-navigation' );
		await expect( sidebar ).toBeVisible();

		await page.waitForLoadState( 'load', { timeout: timeouts.heavyAction } );

		await expect.soft( page ).toHaveScreenshot( 'editor-one-quickstart-full-page-hebrew.png', {
			timeout: timeouts.heavyAction,
			maxDiffPixelRatio: 0.1,
			mask: [ page.locator( '#wpadminbar' ), page.locator( '#adminmenumain' ) ],
		} );
	} );
} );
