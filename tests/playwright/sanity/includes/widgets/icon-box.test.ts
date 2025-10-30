import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import _path from 'path';

test.describe( 'Icon Box widget tests', () => {
	test( 'Test icon position', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setSiteLanguage( '' );

		const editor = await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();

		// Act.
		const filePath = _path.resolve( __dirname, `./../../templates/icon-box.json` );
		await editor.loadTemplate( filePath, false );

		const pageId = await editor.getPageId();
		await editor.publishAndViewPage();

		// Assert.
		await test.step( 'LTR layouts', async () => {
			const iconBoxes = page.locator( '.e-con-inner' ).first();
			await iconBoxes.waitFor();
			await expect.soft( iconBoxes ).toHaveScreenshot( 'icon-box-layouts-physical-properties-ltr.png' );
		} );

		await test.step( 'RTL layouts', async () => {
			await wpAdmin.setSiteLanguage( 'he_IL' );

			await editor.page.goto( `/?p=${ pageId }` );
			await editor.page.waitForLoadState();

			const iconBoxes = page.locator( '.e-con-inner' ).first();
			await iconBoxes.waitFor();
			await expect.soft( iconBoxes ).toHaveScreenshot( 'icon-box-layouts-physical-properties-rtl.png' );
		} );

		await wpAdmin.setSiteLanguage( '' );
	} );
} );
