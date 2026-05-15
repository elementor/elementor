import { parallelTest as test } from '../../playwright/parallelTest';
import _path from 'path';
import WpAdminPage from '../../playwright/pages/wp-admin-page';
import EditorPage from '../../playwright/pages/editor-page';
import ElementRegressionHelper from '../helper';

test.describe( 'Elementor regression tests with templates for CORE - V4', () => {
	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await wpAdmin.setExperiments( { e_atomic_elements: 'active' } );
		await page.close();
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await page.close();
	} );

	const testData = [
		'e_button',
		'e_heading',
		'e_paragraph',
		'e_image',
	];

	for ( const widgetType of testData ) {
		test( `Test ${ widgetType } template`, async ( { page, apiRequests }, testInfo ) => {
			const filePath = _path.resolve( __dirname, `./templates/atomic/${ widgetType }.json` );
			const hoverSelector = {};

			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			const editor = new EditorPage( page, testInfo );
			const helper = new ElementRegressionHelper( page, testInfo );
			await wpAdmin.openNewPage();
			await editor.closeNavigatorIfOpen();

			await editor.loadTemplate( filePath, true );
			await editor.waitForIframeToLoaded( widgetType );

			await page.setViewportSize( { width: 1920, height: 3080 } );
			await editor.page.waitForLoadState( 'domcontentloaded' );
			await helper.doScreenshot( widgetType, false );
			await helper.doHoverScreenshot( { widgetType, hoverSelector, isPublished: false } );
			await helper.doResponsiveScreenshot( { device: 'mobile', isPublished: false, widgetType } );
			await helper.doResponsiveScreenshot( { device: 'tablet', isPublished: false, widgetType } );

			await editor.publishAndViewPage();

			await editor.waitForIframeToLoaded( widgetType, true );
			await editor.removeWpAdminBar();
			await page.setViewportSize( { width: 1920, height: 1080 } );
			await helper.doScreenshot( widgetType, true );
			await helper.doHoverScreenshot( { widgetType, hoverSelector, isPublished: true } );
			await helper.doResponsiveScreenshot( { device: 'mobile', isPublished: true, widgetType } );
			await helper.doResponsiveScreenshot( { device: 'tablet', isPublished: true, widgetType } );
		} );
	}
} );
