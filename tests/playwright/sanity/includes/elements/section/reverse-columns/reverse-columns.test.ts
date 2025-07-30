import { parallelTest as test } from '../../../../../parallelTest';
import Breakpoints from '../../../../../assets/breakpoints';
import ReverseColumns from './reverse-columns';
import WpAdminPage from '../../../../../pages/wp-admin-page';

test.describe( 'Reverse Columns tests @reverse-columns', () => {
	test.describe( 'Custom Breakpoints: Off', () => {
		test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
			const context = await browser.newContext();
			const page = await context.newPage();
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			await wpAdmin.setExperiments( { container: false, additional_custom_breakpoints: false } );
		} );

		test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
			const context = await browser.newContext();
			const page = await context.newPage();
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			await wpAdmin.resetExperiments();
			await page.close();
		} );

		for ( const testDevice of Breakpoints.getBasic() ) {
			if ( 'desktop' === testDevice ) {
				continue;
			}

			test( `Reverse columns: ${ testDevice } - Custom breakpoints: Off`, async ( { page, apiRequests }, testInfo ) => {
				const reverseColumns = new ReverseColumns( page, testInfo, apiRequests );
				await reverseColumns.testReverseColumnsOneActivated( testDevice );
			} );
		}

		test( 'Reverse columns: All - Custom breakpoints: Off', async ( { page, apiRequests }, testInfo ) => {
			const reverseColumns = new ReverseColumns( page, testInfo, apiRequests );
			await reverseColumns.testReverseColumnsAllActivated();
		} );
	} );

	test.describe( 'Custom Breakpoints: On', () => {
		test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
			const context = await browser.newContext();
			const page = await context.newPage();
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			await wpAdmin.setExperiments( { container: false, additional_custom_breakpoints: true } );
			const reverseColumns = new ReverseColumns( page, testInfo, apiRequests );
			await reverseColumns.initAdditionalBreakpoints();
		} );

		test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
			const context = await browser.newContext();
			const page = await context.newPage();
			const reverseColumns = new ReverseColumns( page, testInfo, apiRequests );
			await reverseColumns.resetAdditionalBreakpoints();
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			await wpAdmin.resetExperiments();
			await page.close();
		} );

		for ( const testDevice of Breakpoints.getAll() ) {
			if ( 'desktop' === testDevice ) {
				continue;
			}

			test( `Reverse columns: ${ testDevice } - Custom breakpoints: On`, async ( { page, apiRequests }, testInfo ) => {
				const reverseColumns = new ReverseColumns( page, testInfo, apiRequests );
				await reverseColumns.testReverseColumnsOneActivated( testDevice, true );
			} );
		}

		test( 'Reverse columns: All - Custom breakpoints: On', async ( { page, apiRequests }, testInfo ) => {
			const reverseColumns = new ReverseColumns( page, testInfo, apiRequests );
			await reverseColumns.testReverseColumnsAllActivated( true );
		} );
	} );
} );
