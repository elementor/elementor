import { BrowserContext, Page, expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';

import { initTemplate } from './utils';
import VariablesManagerPage from './variables-manager-page';
import WpAdminPage from '../../../../pages/wp-admin-page';

test.describe( 'Variable Manager @v4-tests', () => {
	let wpAdminPage: WpAdminPage;
	let context: BrowserContext;
	let page: Page;
	let variablesManagerPage: VariablesManagerPage;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		page = await context.newPage();
		wpAdminPage = await initTemplate( page, testInfo, apiRequests );
		variablesManagerPage = new VariablesManagerPage( page );
	} );

	test.beforeEach( async () => {
		await variablesManagerPage.deleteAllVariables();
	} );

	test.afterAll( async () => {
		await wpAdminPage?.resetExperiments();
		await context.close();
	} );

	test( 'Empty state', async () => {
		await test.step( 'Display empty state message when no variables exist', async () => {
			await variablesManagerPage.openVariableManager( 'Typography', 'text-color' );
			await expect( page.getByText( 'Create your first variable' ) ).toBeVisible();
		} );

		await test.step( 'Show create menu when create button is clicked', async () => {
			await page.getByRole( 'button', { name: 'Create a variable' } ).click();
			await expect( page.getByTestId( 'variable-manager-create-menu' ) ).toBeVisible();
		} );
	} );

	test( 'Font Variable exists after creating in panel', async ( ) => {
		const addedFontVariable = await variablesManagerPage.addFontVariable();
		await variablesManagerPage.openVariableManager( 'Typography', 'font-family' );
		const variableRow = page.locator( 'tr', { hasText: addedFontVariable.name } );
		await expect( variableRow ).toBeVisible();
		await expect( variableRow.getByText( addedFontVariable.value ) ).toBeVisible();
	} );
	test( 'Color Variable exists after creating in panel', async ( ) => {
		const addedColorVariable = await variablesManagerPage.addColorVariable();
		await variablesManagerPage.openVariableManager( 'Typography', 'text-color' );
		const variableRow = page.locator( 'tr', { hasText: addedColorVariable.name } );
		await expect( variableRow ).toBeVisible();
		await expect( variableRow.getByText( addedColorVariable.value ) ).toBeVisible();
	} );
	test( 'Color variable screenshot test', async ( ) => {
		await variablesManagerPage.addColorVariable();
		await variablesManagerPage.openVariableManager( 'Typography', 'text-color' );
		await expect( page.locator( '#elementor-panel' ) ).toHaveScreenshot( 'color-variable-screenshot.png' );
	} );

	test( 'Variable name validation error displays and clears in the manager', async () => {
		await variablesManagerPage.createVariableFromManager( 'color' );
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
