import { test } from '@playwright/test';
import WpAdminPage from '../../../pages/wp-admin-page';
import { expectScreenshotToMatchLocator } from './helper';

test.describe( 'Nested Accordion Title Icon and Text No Overlap @nested-accordion', () => {
	test.beforeAll( async ( { browser }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
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

	test( 'Nested Accordion Title Icon and Text No Overlap', async ( { browser }, testInfo ) => {
		const page = await browser.newPage(),
			wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		let nestedAccordionID,
			nestedAccordion;

		await test.step( 'Set horizontal icon & style size to 70', async () => {
			// Act
			await editor.closeNavigatorIfOpen();
			nestedAccordionID = await editor.addWidget( 'nested-accordion', container );
			nestedAccordion = await editor.selectElement( nestedAccordionID );
			await editor.activatePanelTab( 'content' );
			await page.locator( '.elementor-control-icons--inline__displayed-icon' ).first().click();
			await page.locator( '#elementor-icons-manager__search > input' ).fill( 'address card' );
			await page.locator( '#elementor-icons-manager__tab__content > div.elementor-icons-manager__tab__item' ).first().click();
			await page.locator( '.dialog-insert_icon' ).click();
			await editor.activatePanelTab( 'style' );
			await editor.openSection( 'section_header_style' );
			await editor.setSliderControlValue( 'icon_size', '70' );

			// Assert
			await expectScreenshotToMatchLocator( 'header-style-editor.png', nestedAccordion );
		} );
	} );
} );
