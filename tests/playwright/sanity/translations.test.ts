import { parallelTest as test } from '../parallelTest';
import WpAdminPage from '../pages/wp-admin-page';
import { expect } from '@playwright/test';
import EditorPage from '../pages/editor-page';
import { testCaseslanguages } from './translations.languages';

test.describe( 'Test site translation for different languages', () => {
	testCaseslanguages.forEach( ( languageObj ) => {
		test( `Test of site translation for language ${ languageObj.language }`, async ( { browser, apiRequests }, testInfo ) => {
			// Arrange.
			const context = await browser.newContext();
			const page = await context.newPage();
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			const editor = new EditorPage( page, testInfo );

			// Act
			await wpAdmin.setSiteLanguage( languageObj.language );
			await wpAdmin.updateTranslations();
			await wpAdmin.openNewPage();
			await editor.closeNavigatorIfOpen();
			const publishButton = page.locator( 'button.MuiButton-root' ).nth( 1 );

			// Assert.
			await expect( publishButton ).toHaveText( languageObj.buttonText );
			await page.close();
		} );
	} );
} );

test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
	// Reset to default language (English)
	const context = await browser.newContext();
	const page = await context.newPage();
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	await wpAdmin.setSiteLanguage( '' );
} );
