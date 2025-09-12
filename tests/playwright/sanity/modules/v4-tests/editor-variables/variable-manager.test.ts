import { BrowserContext, Page, expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';

import { addColorVariable, addFontVariable, deleteAllVariables, initTemplate, openVariableManager } from './utils';
import WpAdminPage from '../../../../pages/wp-admin-page';

test.describe( 'Variable Manager @v4-tests', () => {
	let wpAdminPage: WpAdminPage;
	let context: BrowserContext;
	let page: Page;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		page = await context.newPage();
		wpAdminPage = await initTemplate( page, testInfo, apiRequests );
	} );

	test.beforeEach( async () => {
		await deleteAllVariables( page );
	} );

	test.afterAll( async () => {
		await wpAdminPage?.resetExperiments();
		await context.close();
	} );

	test( 'Font Variable exists after creating in panel', async ( ) => {
		const addedFontVariable = await addFontVariable( page );
		await openVariableManager( page, 'Typography', 'font-family' );
		const variableRow = page.locator( 'tr', { hasText: addedFontVariable.name } );
		await expect( variableRow ).toBeVisible();
		await expect( variableRow.getByText( addedFontVariable.value ) ).toBeVisible();
	} );
	test( 'Color Variable exists after creating in panel', async ( ) => {
		const addedColorVariable = await addColorVariable( page );
		await openVariableManager( page, 'Typography', 'text-color' );
		const variableRow = page.locator( 'tr', { hasText: addedColorVariable.name } );
		await expect( variableRow ).toBeVisible();
		await expect( variableRow.getByText( addedColorVariable.value ) ).toBeVisible();
	} );
	test( 'Color variable screenshot test', async ( ) => {
		await addColorVariable( page );
		await openVariableManager( page, 'Typography', 'text-color' );
		await expect( page ).toHaveScreenshot( 'color-variable-screenshot.png' );
	} );
} );
