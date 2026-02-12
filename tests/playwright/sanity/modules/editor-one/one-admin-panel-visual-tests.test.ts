import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';

test.describe( 'Editor One Menu Visual Tests', () => {
	test( 'Editor One full page screenshot', async ( { page, apiRequests }, testInfo ) => {
		test.setTimeout( 120000 );
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.openWordPressDashboard();
		const elementorMenu = page.locator( '#toplevel_page_elementor-home' );
		await expect( elementorMenu ).toBeVisible();
		await page.goto( '/wp-admin/admin.php?page=elementor', {
			timeout: 60000,
			waitUntil: 'domcontentloaded'
		} );

		await wpAdmin.dismissEditorOnePointerIfVisible();
		await page.evaluate( () => {
			document.querySelectorAll( '.notice, .update-nag, .e-notice, #wp-pointer-0' ).forEach( ( el ) => el.remove() );
			const iframes = document.querySelectorAll( 'iframe' );
			iframes.forEach( ( iframe ) => {
				if ( iframe ) iframe.style.display = 'none';
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
		await page.waitForLoadState( 'networkidle' );
		await expect.soft( page ).toHaveScreenshot( 'editor-one-quickstart-full-page.png', {
			timeout: 30000,
			maxDiffPixelRatio: 0.1
		} );
	} );
} );
