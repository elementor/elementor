import { parallelTest as test } from '../parallelTest';
import { generatePluginTests } from './plugin-tester-generator';
import WpAdminPage from '../pages/wp-admin-page';
import { wpCli } from '../assets/wp-cli';

test.describe.configure( { mode: 'parallel' } );

test.describe( `Plugin tester tests: sections @plugin_tester_section`, () => {
	test.beforeAll( async () => {
		await wpCli( 'wp elementor experiments deactivate container' );
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
