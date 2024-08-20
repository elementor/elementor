import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { expectScreenshotToMatchLocator, addIcon, setIconSize } from './helper';

test.describe( 'Nested Accordion Title Icon and Text No Overlap @nested-accordion', () => {
	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdmin.setExperiments( {
			container: 'active',
			'nested-elements': 'active',
		} );

		await page.close();
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( {
			'nested-elements': 'inactive',
			container: 'inactive',
			e_font_icon_svg: 'default',
		} );

		await page.close();
	} );

	test( 'Nested Accordion Title Icon and Text No Overlap', async ( { browser, apiRequests }, testInfo ) => {
		let url;
		await test.step( 'experiment Inline Font Icons off', async () => {
			const page = await browser.newPage(),
				wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			await wpAdmin.setExperiments( {
				e_font_icon_svg: 'inactive',
			} );
			const editor = await wpAdmin.openNewPage(),
				container = await editor.addElement( { elType: 'container' }, 'document' );

			// Act
			// Set horizontal icon & style size to 70
			await editor.closeNavigatorIfOpen();
			const nestedAccordionID = await editor.addWidget( 'nested-accordion', container );
			const nestedAccordion = await editor.selectElement( nestedAccordionID );
			await addIcon( editor, page, 'address card' );
			await setIconSize( editor, '70' );

			// Assert
			await expectScreenshotToMatchLocator( 'header-style-editor-test-off.png', nestedAccordion );
			await editor.publishAndViewPage();
			const nestedAccordionWidget = page.locator( '.e-n-accordion' );
			await editor.isUiStable( nestedAccordionWidget );
			await expectScreenshotToMatchLocator( 'header-style-editor-test-off-frontend.png', nestedAccordionWidget );
			url = page.url();
		} );

		await test.step( 'experiment Inline Font Icons on (default)', async () => {
			const page = await browser.newPage(),
				wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			await wpAdmin.setExperiments( {
				e_font_icon_svg: 'active',
			} );
			const editor = await wpAdmin.openNewPage();

			// Assert
			await page.goto( url );
			const nestedAccordionWidget = page.locator( '.e-n-accordion' );
			await editor.isUiStable( nestedAccordionWidget );
			await expectScreenshotToMatchLocator( 'header-style-editor-test-on-frontend.png', nestedAccordionWidget );
		} );
	} );

	test('Nested Accordion Inside Another Accordion Icon Toggling', async ({ browser, apiRequests }, testInfo) => {
		await test.step('experiment Inline Font Icons off', async () => {
			const page = await browser.newPage(),
				wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			await wpAdmin.setExperiments( {
				e_font_icon_svg: 'active',
			} );
			const editor = await wpAdmin.openNewPage(),
				container = await editor.addElement({ elType: 'container' }, 'document');

			// Add a nested-accordion widget
			await editor.closeNavigatorIfOpen();
			const parentAccordionID = await editor.addWidget('nested-accordion', container);
			await editor.selectElement(parentAccordionID);

			// Add a nested accordion widget inside the parent nested-accordion
			const nestedAccordionID = await editor.addWidget('nested-accordion', parentAccordionID, true);
			await editor.selectElement(nestedAccordionID);
			await editor.publishAndViewPage();

			// Click the second child accordion item to toggle its icon
			const nestedSecondAccordionWidget = page.locator('.e-n-accordion-item-title').nth(2);
			await editor.isUiStable(nestedSecondAccordionWidget);
			const childAccordionItemSecondTitleIcon = nestedSecondAccordionWidget.locator('.e-n-accordion-item-title-icon').first();
			await childAccordionItemSecondTitleIcon.click();

			// Click the third child accordion item to toggle its icon
			const nestedThirdAccordionWidget = page.locator('.e-n-accordion-item-title').nth(3);
			await editor.isUiStable(nestedThirdAccordionWidget);
			const childAccordionItemThirdTitleIcon = nestedThirdAccordionWidget.locator('.e-n-accordion-item-title-icon').first();
			await childAccordionItemThirdTitleIcon.click();

		});
	});
});
