const { test } = require( '@playwright/test' );
const Breakpoints = require( '../../../../../assets/breakpoints' );
const WpAdminPage = require( '../../../../../pages/wp-admin-page' );
const ReverseColumns = require( './reverse-columns' );

test.describe( 'Reverse Columns tests @reverse-columns', () => {
	test.describe( 'Experiment Breakpoints: Off', () => {
		test.beforeAll( async ( { browser }, testInfo ) => {
			const context = await browser.newContext();
			const page = await context.newPage();
			const wpAdmin = new WpAdminPage( page, testInfo );
			await wpAdmin.setExperiments( {
				additional_custom_breakpoints: false,
				container: false,
			} );
		} );

		/**
		 * Experiment Breakpoints(Off)
		 */
		for ( const testDevice of Breakpoints.getBasic() ) {
			if ( 'desktop' === testDevice ) {
				continue;
			}

			test( `Reverse columns:${ testDevice } - Experiment breakpoints:Off`, async ( { page }, testInfo ) => {
				const reverseColumns = new ReverseColumns( page, testInfo );
				await reverseColumns.testReverseColumnsOneActivated( testDevice );
			} );
		}
	} );

	test( 'Reverse columns:All - Experiment breakpoints:Off ', async ( { page }, testInfo ) => {
		const reverseColumns = new ReverseColumns( page, testInfo );
		await reverseColumns.testReverseColumnsAllActivated();
	} );

	/**
	 * Experiment Breakpoints(On)
	 */
	test.describe( 'Experiment Breakpoints: On', () => {
		test.beforeAll( async ( { browser }, testInfo ) => {
			const context = await browser.newContext();
			const page = await context.newPage();
			const wpAdmin = new WpAdminPage( page, testInfo );
			await wpAdmin.setExperiments( {
				additional_custom_breakpoints: true,
				container: false,
			} );
			await wpAdmin.useElementorCleanPost();
			const breakpoints = new Breakpoints( page, testInfo );
			await breakpoints.addAllBreakpoints();
		} );

		test.afterAll( async ( { browser }, testInfo ) => {
			const context = await browser.newContext();
			const page = await context.newPage();
			const wpAdmin = new WpAdminPage( page, testInfo );
			await wpAdmin.setExperiments( {
				additional_custom_breakpoints: false,
			} );
		} );

		for ( const testDevice of Breakpoints.getAll() ) {
			if ( 'desktop' === testDevice ) {
				continue;
			}

			test( `Reverse columns:${ testDevice } - Experiment breakpoints:On`, async ( { page }, testInfo ) => {
				const reverseColumns = new ReverseColumns( page, testInfo );
				await reverseColumns.testReverseColumnsOneActivated( testDevice, true );
			} );
		}

		test( 'Reverse columns:All - Experiment breakpoints:On', async ( { page }, testInfo ) => {
			const reverseColumns = new ReverseColumns( page, testInfo );
			await reverseColumns.testReverseColumnsAllActivated( true );
		} );
	} );
} );
