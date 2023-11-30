import { test, expect } from '@playwright/test';
import WpAdminPage from '../../../pages/wp-admin-page';
import { expectScreenshotToMatchLocator, setTitleTextTag, setTitleIconPosition, setTitleHorizontalAlignment } from './helper';

test.describe( 'Nested Accordion Content Tests @nested-accordion', () => {
	test.beforeAll( async ( { browser }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = await new WpAdminPage( page, testInfo );

		await wpAdmin.setExperiments( {
			container: 'active',
			'nested-elements': 'active',
		} );

		await page.close();
	} );

	test.afterAll( async ( { browser }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			'nested-elements': 'inactive',
			container: 'inactive',
		} );

		await page.close();
	} );

	test( 'Nested Accordion Title Icon and Text Vertical Alignment', async ( { browser }, testInfo ) => {
		const page = await browser.newPage(),
			wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.openNewPage(),
			frame = editor.getPreviewFrame(),
			nestedAccordionWidgetId = '48f02ad',
			nestedAccordionTitle = frame.locator( '.e-n-accordion-item-title' ).first();

		await editor.loadJsonPageTemplate( __dirname, 'nested-accordion-title-and-icons', '.elementor-widget-n-accordion' );

		await editor.closeNavigatorIfOpen();
