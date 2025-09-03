import { expect } from '@playwright/test';

import { variablesManagerFixture } from './base.fixture';

variablesManagerFixture.describe( 'Variable Manager', () => {
	variablesManagerFixture( 'Font Variable exists after creating in panel', async ( { addedFontVariable, openVariableManager } ) => {
		expect( addedFontVariable ).toBeDefined();
		const variableRow = openVariableManager.locator( 'tr', { hasText: addedFontVariable.name } );
		await expect( variableRow ).toBeVisible();
		await expect( variableRow.getByText( addedFontVariable.value ) ).toBeVisible();
	} );
	variablesManagerFixture( 'Color Variable exists after creating in panel', async ( { addedColorVariable, openVariableManager } ) => {
		expect( addedColorVariable ).toBeDefined();
		const variableRow = openVariableManager.locator( 'tr', { hasText: addedColorVariable.name } );
		await expect( variableRow ).toBeVisible();
		await expect( variableRow.getByText( addedColorVariable.value ) ).toBeVisible();
	} );
} );

variablesManagerFixture( 'Variable Manager', async ( { openVariableManager } ) => {
	expect( openVariableManager ).toBeDefined();
} );
