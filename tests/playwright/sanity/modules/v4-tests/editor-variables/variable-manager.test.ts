import { BrowserContext, Page, expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';

import { getTemplatePath, initTemplate } from './utils';
import VariablesManagerPage from './variables-manager-page';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import ApiRequests from '../../../../assets/api-requests';

test.describe( 'Variable Manager @v4-tests', () => {
	let wpAdminPage: WpAdminPage;
	let editorPage: EditorPage;
	let context: BrowserContext;
	let page: Page;
	let variablesManagerPage: VariablesManagerPage;
	let apiRequestsInstance: ApiRequests;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		page = await context.newPage();
		const result = await initTemplate( page, testInfo, apiRequests );
		wpAdminPage = result.wpAdminPage;
		editorPage = result.editorPage;
		variablesManagerPage = new VariablesManagerPage( page );
		apiRequestsInstance = apiRequests;
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

	test( 'should filter out size variables from the list when it is core only', async () => {
		const sizeVariable = { name: 'test-size-variable', value: '20', type: 'size' as const };
		const proPluginSlug = 'elementor-pro/elementor-pro';
		const currentUrl = page.url();

		await test.step( 'Activate Pro and create a size variable', async () => {
			await apiRequestsInstance.activatePlugin( page.context().request, proPluginSlug );
			await page.goto( currentUrl );
			await page.waitForLoadState( 'load' );
			await wpAdminPage.waitForPanel();
			await editorPage.loadTemplate( getTemplatePath() );
			await variablesManagerPage.createVariableFromManager( sizeVariable );
		} );

		await test.step( 'Deactivate Pro and verify size variable is filtered out', async () => {
			await apiRequestsInstance.deactivatePlugin( page.context().request, proPluginSlug );
			await page.goto( currentUrl );
			await page.waitForLoadState( 'load' );
			await wpAdminPage.waitForPanel();
			await editorPage.loadTemplate( getTemplatePath() );
			await wpAdminPage.closeAnnouncementsIfVisible();
			await variablesManagerPage.openVariableManager( 'Typography', 'text-color' );
			const sizeVariableRow = variablesManagerPage.getVariableRowByName( sizeVariable.name );
			await expect( sizeVariableRow ).toBeHidden();
		} );

		await test.step( 'Re-activate Pro for cleanup', async () => {
			await apiRequestsInstance.activatePlugin( page.context().request, proPluginSlug );
		} );
	} );
} );
