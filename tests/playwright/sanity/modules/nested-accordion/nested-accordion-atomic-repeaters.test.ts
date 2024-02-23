import { test } from '@playwright/test';
import WpAdminPage from '../../../pages/wp-admin-page';
import { deleteItemFromRepeater } from './helper';

test.describe( 'Nested Accordion experiment is active @nested-atomic-repeaters', () => {
	test.beforeAll( async ( { browser }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo );

		await wpAdmin.setExperiments( {
			container: 'active',
			'nested-elements': 'active',
			e_nested_atomic_repeaters: 'active',
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
			e_nested_atomic_repeaters: 'inactive',
		} );

		await page.close();
	} );

	test( 'General Test', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.openNewPage(),
			frame = editor.getPreviewFrame(),
			container = await editor.addElement( { elType: 'container' }, 'document' ),
			nestedAccordionItemTitle = frame.locator( '.e-n-accordion-item' ),
			nestedAccordionItemContent = nestedAccordionItemTitle.locator( '.e-con' );

		// Arrange
		await editor.addWidget( 'nested-accordion', container );

		await test.step( 'Remove an item from the repeater', async () => {
			await deleteItemFromRepeater( page, nestedAccordionItemTitle, nestedAccordionItemContent );
		} );
	} );
} );
