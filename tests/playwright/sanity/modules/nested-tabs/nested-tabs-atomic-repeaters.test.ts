import { expect, test } from '@playwright/test';
import WpAdminPage from '../../../pages/wp-admin-page';
import { addItemFromRepeater, cloneItemFromRepeater, deleteItemFromRepeater } from './helper';

test.describe( 'Nested Tabs experiment is active @nested-atomic-repeaters', () => {
	test.beforeAll( async ( { browser }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo );

		await wpAdmin.setExperiments( {
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
			e_nested_atomic_repeaters: 'inactive',
		} );

		await page.close();
	} );

	test( 'Repeaters functionality Test', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' ),
			nestedTabsID = await editor.addWidget( 'nested-tabs', container );

		await editor.selectElement( nestedTabsID );

		await test.step( 'Check that items have following IDs', async () => {
			const tabs = editor.getPreviewFrame().locator( `.elementor-element-${ nestedTabsID }` ),
				tabsItems = tabs.locator( '.e-n-tab-title' ),
				idPrefix = 'e-n-tab-title-',
				firstItemID = await tabsItems.nth( 0 ).getAttribute( 'id' ),
				secondItemId = await tabsItems.nth( 1 ).getAttribute( 'id' ),
				thirdItemId = await tabsItems.nth( 2 ).getAttribute( 'id' );

			expect( await editor.isolatedIdNumber( idPrefix, secondItemId ) ).toBe( await editor.isolatedIdNumber( idPrefix, firstItemID ) + 1 );
			expect( await editor.isolatedIdNumber( idPrefix, thirdItemId ) ).toBe( await editor.isolatedIdNumber( idPrefix, secondItemId ) + 1 );
		} );

		await test.step( 'Remove an item from the repeater', async () => {
			await deleteItemFromRepeater( editor, nestedTabsID );
		} );

		await test.step( 'Check that items have following IDs after Item removal', async () => {
			const tabs = editor.getPreviewFrame().locator( `.elementor-element-${ nestedTabsID }` ),
				tabsItems = tabs.locator( '.e-n-tab-title' ),
				idPrefix = 'e-n-tab-title-',
				firstItemID = await tabsItems.nth( 0 ).getAttribute( 'id' ),
				secondItemId = await tabsItems.nth( 1 ).getAttribute( 'id' );

			expect( await editor.isolatedIdNumber( idPrefix, secondItemId ) ).toBe( await editor.isolatedIdNumber( idPrefix, firstItemID ) + 1 );
		} );

		await test.step( 'Add an item to the repeater', async () => {
			await addItemFromRepeater( editor, nestedTabsID );
		} );

		await test.step( 'Clone first tab item', async () => {
			await cloneItemFromRepeater( editor, nestedTabsID, 0 );
		} );

		await test.step( 'Add an item to the second tabs', async () => {
			const secondContainer = await editor.addElement( { elType: 'container' }, 'document' ),
				secondNestedTabsID = await editor.addWidget( 'nested-tabs', secondContainer );

			await editor.selectElement( secondNestedTabsID );

			await addItemFromRepeater( editor, secondNestedTabsID );
		} );
	} );

	test( 'Performance test for repeater actions (new, clone, delete, sort)', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' ),
			nestedTabsID = await editor.addWidget( 'nested-tabs', container ),
			// Before ( fix ) value 25000
			timeExpected = 300;

		page.setDefaultTimeout( timeExpected );

		await editor.selectElement( nestedTabsID );

		await test.step( 'Add multiple items using repeater', async () => {
			// Add 10 items to the repeater
			for ( let i = 0; i < 4; i++ ) {
				await addItemFromRepeater( editor, nestedTabsID );
			}
		} );

		await test.step( 'Clone multiple tab items', async () => {
			for ( let i = 0; i < 6; i++ ) {
				await cloneItemFromRepeater( editor, nestedTabsID, 0 );
			}
		} );

		await test.step( 'Delete multiple tab items', async () => {
			for ( let i = 0; i < 2; i++ ) {
				await deleteItemFromRepeater( editor, nestedTabsID );
			}
		} );
	} );
} );
