import test, { expect } from '@playwright/test';

import { addColorVariable, addFontVariable, initTemplate, openVariableManager } from './utils';

test.describe( 'Variable Manager @v4-tests', () => {
	test.beforeEach( async ( { page } ) => {
		await initTemplate( page );
	} );

	test( 'Font Variable exists after creating in panel', async ( { page } ) => {
		const addedFontVariable = await addFontVariable( page );
		await openVariableManager( page, 'Typography', 'font-family' );
		const variableRow = page.locator( 'tr', { hasText: addedFontVariable.name } );
		await expect( variableRow ).toBeVisible();
		await expect( variableRow.getByText( addedFontVariable.value ) ).toBeVisible();
	} );
	test( 'Color Variable exists after creating in panel', async ( { page } ) => {
		const addedColorVariable = await addColorVariable( page );
		await openVariableManager( page, 'Typography', 'text-color' );
		const variableRow = page.locator( 'tr', { hasText: addedColorVariable.name } );
		await expect( variableRow ).toBeVisible();
		await expect( variableRow.getByText( addedColorVariable.value ) ).toBeVisible();
	} );
} );
