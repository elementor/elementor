import { setDefaultTemplate } from 'playwright';
import { type Page, test } from '@playwright/test';

import { openVariableManager } from './utils';
import WpAdminPage from '../../tests/playwright/pages/wp-admin-page';

export const variablesManagerFixture = test.extend< {
	openVariableManager: Page;
} >( {
	openVariableManager: async ( { page }, use ) => {
		const adminPage = new WpAdminPage( page );
		await adminPage.setExperiments( { variables_manager: 'active' } );
		await setDefaultTemplate( page );
		await openVariableManager( page );
		await use( page );
	},
} );
