import { BrowserContext, Page, expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';

import {
	addColorVariable, addFontVariable,
	createVariableFromManager, deleteAllVariables, initTemplate, openVariableManager,
} from './utils';
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

	test( 'Variable name validation error displays and clears in the manager', async () => {
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

	test( 'Empty state', async () => {
		await test.step( 'Display empty state message when no variables exist', async () => {
			await openVariableManager( page, 'Typography', 'text-color' );
			await expect( page.getByText( 'Create your first variable' ) ).toBeVisible();
		} );

		await test.step( 'Show create menu when create button is clicked', async () => {
			await page.getByRole( 'button', { name: 'Create a variable' } ).click();
			await expect( page.getByTestId( 'variable-manager-create-menu' ) ).toBeVisible();
		} );
	} );
} );
