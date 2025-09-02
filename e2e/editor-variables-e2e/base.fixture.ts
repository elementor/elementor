import { setDefaultTemplate } from 'playwright';
import { type Page, test } from '@playwright/test';

import { openVariableManager, addVariable, detachVariable } from './utils';
import WpAdminPage from '../../tests/playwright/pages/wp-admin-page';

export const variablesManagerFixture = test.extend< {
	init: Page;
	addedFontVariable: { name: string, value: string };
	addedColorVariable: { name: string, value: string };
	openVariableManager: Page;
} >( {
	init: async ( { page }, use ) => {
		const adminPage = new WpAdminPage( page );
		await adminPage.setExperiments( { e_variables_manager: 'active' } );
		await setDefaultTemplate( page );
		await use( page );
	},
	addedFontVariable: async ( { init: page }, use ) => {
		const variableData = { name: `test-font-variable-${ Date.now() }`, value: 'Arial', type: 'font' as const };
		await addVariable( page, variableData, 'Typography', 'font-family' );
		await detachVariable( page, 'Typography', 'Font Family', variableData.name );
		await use( variableData );
	},
	addedColorVariable: async ( { init: page }, use ) => {
		const variableData = { name: `test-color-variable-${ Date.now() }`, value: 'Red', type: 'color' as const };
		await addVariable( page, variableData, 'Typography', 'text-color' );
		await detachVariable( page, 'Typography', 'Text Color', variableData.name );
		await use( variableData );
	},
	openVariableManager: async ( { page }, use ) => {
		await openVariableManager( page, 'Typography', 'font-family' );
		await use( page );
	},
} );
