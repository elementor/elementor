import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';

test.describe( 'Editor One Menu Visual Tests', () => {
	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setSiteLanguage( '' );
		await context.close();
	} );

	test( 'Editor One full page screenshot - Hebrew', async ( { page, apiRequests }, testInfo ) => {
		test.setTimeout( 120000 );

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
			timeout: 60000,
			waitUntil: 'domcontentloaded',
		} );

		await wpAdmin.dismissEditorOnePointerIfVisible();

		await page.evaluate( () => {
			document.querySelectorAll( '.notice, .update-nag, .e-notice, #wp-pointer-0' ).forEach( ( el ) => el.remove() );

			const iframes = document.querySelectorAll( 'iframe' );
			iframes.forEach( ( iframe ) => {
				if ( iframe ) {
					iframe.remove();
				}
			} );

			const adminBar = document.getElementById( 'wpadminbar' );
			const adminMenu = document.getElementById( 'adminmenumain' );

			if ( adminBar ) {
				adminBar.style.display = 'none';
			}
			if ( adminMenu ) {
				adminMenu.style.display = 'none';
			}
		} );

		const sidebar = page.locator( '#editor-one-sidebar-navigation' );
		await expect( sidebar ).toBeVisible();

		await page.waitForLoadState( 'networkidle', { timeout: 30000 } ).catch( () => {} );

		await expect.soft( page ).toHaveScreenshot( 'editor-one-quickstart-full-page-hebrew.png', {
			timeout: 30000,
			maxDiffPixelRatio: 0.1,
		} );
	} );
} );
