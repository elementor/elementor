import { BrowserContext, Page, expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';

import { addColorVariable, addFontVariable, initTemplate, openVariableManager, createVariableFromManager } from './utils';
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

	test( 'Variable name validation error displays and clears correctly', async () => {
		await createVariableFromManager( page, 'color' );
		const nameField = page.getByRole( 'textbox', { name: 'Name' } );

		await test.step( 'Display validation error for invalid input', async () => {
			await nameField.fill( ' ' );
			await expect( page.getByText( 'Give your variable a name.' ) ).toBeVisible();
		} );

		await test.step( 'Clear validation error when input is fixed', async () => {
			await nameField.fill( 'valid-variable-name' );
			await expect( page.getByText( 'Give your variable a name.' ) ).not.toBeVisible();
		} );
	} );
} );
