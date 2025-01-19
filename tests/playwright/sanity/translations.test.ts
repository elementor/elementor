import { parallelTest as test } from '../parallelTest';
import WpAdminPage from '../pages/wp-admin-page';
import { expect } from '@playwright/test';
import EditorPage from '../pages/editor-page';

const testCaseslanguages = [
	{
		language: 'he_IL',
		buttonText: 'פרסם',
	},
	{
		language: 'en_NZ',
		buttonText: 'Publish',
	},
	{
		language: 'de_DE',
		buttonText: 'Veröffentlichen',
	},
	{
		language: 'fr_BE',
		buttonText: 'Publier',
	},
];

test.describe( 'Test site translation for different languages', () => {
	testCaseslanguages.forEach( ( languageObj ) => {
		test( `Test of site translation for language ${ languageObj.language }`, async ( { browser, apiRequests }, testInfo ) => {
			// Arrange.
			const context = await browser.newContext();
			const page = await context.newPage();
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			const editor = new EditorPage( page, testInfo );
			const translationButton = 'Form[name=upgrade-translations] input[type=submit]';

			// Act
			await wpAdmin.setSiteLanguage( languageObj.language );
			await page.goto( '/wp-admin/update-core.php' );
			await page.locator( '.update-last-checked' ).click();
			if ( await page.locator( translationButton ).isVisible() ) {
				await page.locator( translationButton ).click();
			}
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