import { parallelTest as test } from '../../../../../parallelTest';
import Breakpoints from '../../../../../assets/breakpoints';
import ReverseColumns from './reverse-columns';
import WpAdminPage from '../../../../../pages/wp-admin-page';

test.describe( 'Reverse Columns tests @reverse-columns', () => {
	test.describe( 'Experiment Breakpoints: Off', () => {
		test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
			const context = await browser.newContext();

			const page = await context.newPage();

			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			await wpAdmin.setExperiments( {
				additional_custom_breakpoints: false,
				container: false,
			} );
		} );
		for ( const testDevice of Breakpoints.getBasic() ) {
			if ( 'desktop' === testDevice ) {
				continue;
			}

			test( `Reverse columns:${ testDevice } - Experiment breakpoints:Off`, async ( { page, apiRequests }, testInfo ) => {
				const reverseColumns = new ReverseColumns( page, testInfo, apiRequests );
				await reverseColumns.testReverseColumnsOneActivated( testDevice );
			} );
		}

		test( 'Reverse columns:All - Experiment breakpoints:Off ', async ( { page, apiRequests }, testInfo ) => {
			const reverseColumns = new ReverseColumns( page, testInfo, apiRequests );
			await reverseColumns.testReverseColumnsAllActivated();
		} );
	} );

	test.describe( 'Experiment Breakpoints: On', () => {
		test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
			const context = await browser.newContext();
			const page = await context.newPage();

			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			await wpAdmin.setExperiments( {
				additional_custom_breakpoints: true,
				container: false,
			} );
			const reverseColumns = new ReverseColumns( page, testInfo, apiRequests );
			await reverseColumns.initAdditionalBreakpoints();
		} );
		test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
			const context = await browser.newContext();
			const page = await context.newPage();

			const reverseColumns = new ReverseColumns( page, testInfo, apiRequests );
			await reverseColumns.resetAdditionalBreakpoints();
		} );
		for ( const testDevice of Breakpoints.getAll() ) {
			if ( 'desktop' === testDevice ) {
				continue;
			}

			test( `Reverse columns:${ testDevice } - Experiment breakpoints:On`, async ( { page, apiRequests }, testInfo ) => {
				const reverseColumns = new ReverseColumns( page, testInfo, apiRequests );
				await reverseColumns.testReverseColumnsOneActivated( testDevice, true );
			} );
		}

		test( 'Reverse columns:All - Experiment breakpoints:On', async ( { page, apiRequests }, testInfo ) => {
			const reverseColumns = new ReverseColumns( page, testInfo, apiRequests );
			await reverseColumns.testReverseColumnsAllActivated( true );
		} );
	} );
} );
