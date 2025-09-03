import { type Page, test } from '@playwright/test';

import { openVariableManager } from './utils';
import WpAdminPage from '../../../../pages/wp-admin-page';

export const variablesManagerFixture = test.extend< {
	openVariableManager: Page;
} >( {
	openVariableManager: async ( { page }, use ) => {
		const adminPage = new WpAdminPage( page );
		await adminPage.setExperiments( { e_variables_manager: 'active' } );
		const editorPage = await adminPage.openNewPage();
		editorPage.loadTemplate( 'tests/playwright/templates/default-v4.json' );
		await openVariableManager( page );
		await use( page );
	},
} );
