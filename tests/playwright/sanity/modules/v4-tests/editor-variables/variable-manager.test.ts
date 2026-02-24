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
		const addedFontVariable = { name: 'test-font-variable', value: 'Arial', type: 'font' as const };
		const variableRow = await variablesManagerPage.createVariableFromManager( addedFontVariable );
		await expect( variableRow ).toBeVisible();
		await expect( variableRow.getByText( addedFontVariable.value ) ).toBeVisible();
		await expect( page.locator( '#elementor-panel' ) ).toHaveScreenshot( 'font-variable-screenshot.png' );
	} );

	test( 'Color variable exists and screenshot', async ( ) => {
		const addedColorVariable = { name: 'test-color-variable', value: '#000000', type: 'color' as const };
		const variableRow = await variablesManagerPage.createVariableFromManager( addedColorVariable );
		await expect( variableRow ).toBeVisible();
		await expect( variableRow.getByText( addedColorVariable.value ) ).toBeVisible();
		await expect( page.locator( '#elementor-panel' ) ).toHaveScreenshot( 'color-variable-screenshot.png' );
	} );

	test( 'Variable name validation error displays and clears in the manager', async () => {
		const variableRow = await variablesManagerPage.createVariableFromManager( { name: 'test-variable', value: '#000000', type: 'color' } );
		const nameField = variableRow.getByRole( 'button' ).nth( 1 );
		await nameField.dblclick();
		const nameInput = variableRow.getByRole( 'textbox' );

		await test.step( 'Display validation error for invalid input', async () => {
			await nameInput.fill( ' ' );
			await expect( page.getByText( 'Give your variable a name.' ) ).toBeVisible();
		} );

		await test.step( 'Clear validation error when input is fixed', async () => {
			await nameInput.fill( 'valid-variable-name' );
			await expect( page.getByText( 'Give your variable a name.' ) ).not.toBeVisible();
		} );
	} );
} );
