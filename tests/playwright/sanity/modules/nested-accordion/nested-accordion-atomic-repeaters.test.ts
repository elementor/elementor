import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { addItemFromRepeater, cloneItemFromRepeater, deleteItemFromRepeater } from './helper';
import _path from 'path';

test.describe( 'Nested Accordion experiment is active @nested-atomic-repeaters', () => {
	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdmin.setExperiments( {
			'nested-elements': 'active',
			e_nested_atomic_repeaters: 'active',
		} );

		await page.close();
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( {
			'nested-elements': 'inactive',
			e_nested_atomic_repeaters: 'inactive',
		} );

		await page.close();
	} );

	test( 'Atomic repeaters functionality', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' ),
			nestedAccordionID = await editor.addWidget( 'nested-accordion', container );

		await editor.selectElement( nestedAccordionID );

		await test.step( 'Check that items have following IDs', async () => {
			const accordion = editor.getPreviewFrame().locator( `.elementor-element-${ nestedAccordionID }` ),
				accordionItems = accordion.locator( '.e-n-accordion-item' ),
				idPrefix = 'e-n-accordion-item-',
				firstItemID = await accordionItems.nth( 0 ).getAttribute( 'id' ),
				secondItemId = await accordionItems.nth( 1 ).getAttribute( 'id' ),
				thirdItemId = await accordionItems.nth( 2 ).getAttribute( 'id' );

			expect( await editor.isolatedIdNumber( idPrefix, secondItemId ) ).toBe( await editor.isolatedIdNumber( idPrefix, firstItemID ) + 1 );
			expect( await editor.isolatedIdNumber( idPrefix, thirdItemId ) ).toBe( await editor.isolatedIdNumber( idPrefix, secondItemId ) + 1 );
		} );

		await test.step( 'Remove an item from the repeater', async () => {
			await deleteItemFromRepeater( editor, nestedAccordionID );
		} );

		await test.step( 'Check that items have following IDs after Item removal', async () => {
			const accordion = editor.getPreviewFrame().locator( `.elementor-element-${ nestedAccordionID }` ),
				accordionItems = accordion.locator( '.e-n-accordion-item' ),
				idPrefix = 'e-n-accordion-item-',
				firstItemID = await accordionItems.nth( 0 ).getAttribute( 'id' ),
				secondItemId = await accordionItems.nth( 1 ).getAttribute( 'id' );

			expect( await editor.isolatedIdNumber( idPrefix, secondItemId ) ).toBe( await editor.isolatedIdNumber( idPrefix, firstItemID ) + 1 );
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

	test( 'Test with existing template', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			editor = await wpAdmin.openNewPage();

		const filePath = _path.resolve( __dirname, `./templates/nested-accordion-with-content.json` );
		await editor.loadTemplate( filePath, false );

		await test.step( 'Clone first accordion item', async () => {
			await cloneItemFromRepeater( editor, 'first' );
		} );

		await test.step( 'Clone last accordion item', async () => {
			await cloneItemFromRepeater( editor, 'last' );
		} );
	} );

	test( 'Nested Accordion with inner Nested Accordion', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			editor = await wpAdmin.openNewPage();

		const filePath = _path.resolve( __dirname, `./templates/nested-accordion-with-nested-accordion.json` );
		await editor.loadTemplate( filePath, false );

		await test.step( 'Clone first accordion item', async () => {
			// Arrange
			await editor.getPreviewFrame().locator( '.e-n-accordion' ).first().waitFor();

			// Act
			await editor.getPreviewFrame().locator( '.e-n-accordion-item-title' ).first().click();
			const cloneItemButton = editor.page.getByRole( 'button', { name: 'Duplicate' } ).first();
			await cloneItemButton.click();

			// Assert
			const parentAccordion = editor.getPreviewFrame().locator( '.e-n-accordion:nth-child(1)' ),
				originalChildNestedAccordion = parentAccordion.locator( '> details:nth-child(1) details' ),
				duplicatedChildNestedAccordion = parentAccordion.locator( '> details:nth-child(2) details' );

			expect( await duplicatedChildNestedAccordion.count() ).toBe( await originalChildNestedAccordion.count() );
		} );
	} );
} );
