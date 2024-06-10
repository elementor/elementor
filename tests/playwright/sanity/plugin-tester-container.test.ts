import { test } from '@playwright/test';
import { generatePluginTests } from './plugin-tester-generator';
import WpAdminPage from '../pages/wp-admin-page';

test.describe( `Plugin tester tests: containers`, () => {
	test.beforeAll( async ( { browser }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.resetExperiments();

		await page.close();
	} );

	generatePluginTests( 'containers' );
} );
