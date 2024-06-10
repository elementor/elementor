import { test } from '@playwright/test';
import { generatePluginTests } from './plugin-tester-generator';
import WpAdminPage from '../pages/wp-admin-page';

test.describe( `Plugin tester tests: sections`, () => {
	test.beforeAll( async ( { browser }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.resetExperiments();
		await wpAdmin.setExperiments( { container: false } );

		await page.close();
	} );

	generatePluginTests( 'sections' );
} );
