import { expect, type Locator, type Page } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';

const KIT_LIBRARY_URL = '/wp-admin/admin.php?page=elementor-app#/kit-library';
const SORT_SELECT = '.eps-sort-select__select';
const KIT_ITEM = '.e-kit-library__kit-item';
const KIT_ITEM_TITLE = `${ KIT_ITEM } .eps-card__headline`;
const FEATURED_VALUE = 'featuredIndex';
const NEW_VALUE = 'createdAt';

async function gotoKitLibrary( page: Page ): Promise<void> {
	await page.goto( KIT_LIBRARY_URL );
	await page.waitForLoadState( 'networkidle' );
	await page.locator( KIT_ITEM ).first().waitFor();
}

async function collectKitTitles( page: Page ): Promise<string[]> {
	const items: Locator = page.locator( KIT_ITEM_TITLE );
	await expect.poll( () => items.count() ).toBeGreaterThan( 1 );
	return items.allInnerTexts();
}

test.describe( 'Kit Library - Website Templates page', () => {
	test( 'changing sort from Featured to New produces a different list', async ( { page } ) => {
		// Arrange
		await gotoKitLibrary( page );
		const sortSelect = page.locator( SORT_SELECT );
		await expect( sortSelect ).toHaveValue( FEATURED_VALUE );
		const featuredTitles = await collectKitTitles( page );
		expect( featuredTitles.length ).toBeGreaterThan( 1 );

		// Act
		await sortSelect.selectOption( NEW_VALUE );
		await expect( sortSelect ).toHaveValue( NEW_VALUE );
		await expect.poll( async () => {
			const titles = await page.locator( KIT_ITEM_TITLE ).allInnerTexts();
			return JSON.stringify( titles );
		} ).not.toBe( JSON.stringify( featuredTitles ) );
		const newTitles = await collectKitTitles( page );

		// Assert
		expect( newTitles.length ).toBeGreaterThan( 1 );
		expect( newTitles ).not.toEqual( featuredTitles );
	} );
} );
