import { parallelTest as test } from '../parallelTest';
import { generatePluginTests } from './plugin-tester-generator';
import WpAdminPage from '../pages/wp-admin-page';

test.describe.configure( { mode: 'parallel' } );

test.describe( `Plugin tester tests: sections`, () => {
	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await wpAdmin.setExperiments( { container: 'inactive', e_optimized_markup: 'active' } );

		await page.close();
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await page.close();
	} );

	generatePluginTests( 'sections' );
} );
