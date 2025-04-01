// import { parallelTest as test } from '../../../parallelTest';
// import WpAdminPage from '../../../pages/wp-admin-page';
// import PromotionsHelper from '../../../pages/promotions/helper';
//
// test.describe( 'V4 modal promotion test @promotions', () => {
// 	const experimentName = 'e_atomic_elements';
//
// 	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
// 		const context = await browser.newContext();
// 		const page = await context.newPage();
// 		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
// 		await wpAdmin.setExperiments( {
// 			[ experimentName ]: 'active',
// 		} );
// 		await page.close();
// 	} );
//
// 	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
// 		const context = await browser.newContext();
// 		const page = await context.newPage();
// 		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
// 		await wpAdmin.resetExperiments();
// 		await page.close();
// 	} );
//
// 	test( 'V4 chip & modal visible', async ( { page, apiRequests }, testInfo ) => {
// 		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
// 			promotionsHelper = new PromotionsHelper( page, testInfo );
//
// 		await wpAdmin.openNewPage();
// 		await promotionsHelper.v4PromotionModalVisibilityTest();
// 	} );
// } );
