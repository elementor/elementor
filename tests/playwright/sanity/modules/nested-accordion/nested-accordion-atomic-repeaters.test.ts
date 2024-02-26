import { test } from '@playwright/test';
import WpAdminPage from '../../../pages/wp-admin-page';
import { addItemFromRepeater, deleteItemFromRepeater } from './helper';

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

	test.only( 'General Test', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' ),
			nestedAccordionID = await editor.addWidget( 'nested-accordion', container );
		// Arrange

		await editor.selectElement( nestedAccordionID );

		await test.step( 'Remove an item from the repeater', async () => {
			await deleteItemFromRepeater( editor, nestedAccordionID );
		} );

		await test.step( 'Add an item to the repeater', async () => {
			await addItemFromRepeater( editor, nestedAccordionID );
		} );

		await test.step( 'Add an item to the second accordion', async () => {
			const secondContainer = await editor.addElement( { elType: 'container' }, 'document' ),
				secondNestedAccordionID = await editor.addWidget( 'nested-accordion', secondContainer );

			await editor.selectElement( secondNestedAccordionID );

			await addItemFromRepeater( editor, secondNestedAccordionID );
		} );
	} );
} );
