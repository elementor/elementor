import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { addItemFromRepeater, cloneItemFromRepeater, deleteItemFromRepeater, setup } from './helper';
import _path from 'path';

test.describe( 'Nested Tabs experiment is active @nested-atomic-repeaters', () => {
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

	test( 'Repeaters functionality Test', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
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

	test( 'Performance test for repeater actions (new, clone, delete, sort)', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' ),
			nestedTabsID = await editor.addWidget( 'nested-tabs', container ),
			// Before ( fix ) value 25000
			timeExpected = 300;

		page.setDefaultTimeout( timeExpected );

		await editor.selectElement( nestedTabsID );

		await test.step( 'Add multiple items using repeater', async () => {
			for ( let i = 0; i < 2; i++ ) {
				await addItemFromRepeater( editor, nestedTabsID );
			}
		} );

		await test.step( 'Clone multiple tab items', async () => {
			for ( let i = 0; i < 2; i++ ) {
				await cloneItemFromRepeater( editor, nestedTabsID, 0 );
			}
		} );

		await test.step( 'Delete multiple tab items', async () => {
			for ( let i = 0; i < 2; i++ ) {
				await deleteItemFromRepeater( editor, nestedTabsID );
			}
		} );
	} );

	test( 'Test Nested Tabs with Inner Nested Tabs', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await setup( wpAdmin );
		const editor = await wpAdmin.openNewPage(),
			frame = editor.getPreviewFrame();

		await editor.closeNavigatorIfOpen();

		// Load template.
		const filePath = _path.resolve( __dirname, `./templates/nested-tabs-with-inner-nested-tabs.json` );
		await editor.loadTemplate( filePath, false );
		await frame.locator( '.e-n-tabs .e-n-tabs .e-n-tab-title' ).nth( 2 ).waitFor();

		await test.step( 'Select Tab2 of Inner Tabs', async () => {
			const innerTabsSecondTab = frame.locator( '.e-n-tabs-content .e-n-tab-title' ).nth( 1 );
			await innerTabsSecondTab.click();

			// Assert
			await editor.togglePreviewMode();
			await expect.soft( frame.locator( '.e-n-tabs' ).nth( 0 ) ).toHaveScreenshot( 'inner-tabs-tab2.png' );
			await editor.togglePreviewMode();
		} );

		await test.step( 'Clone Last Tab of Inner Nested Tabs', async () => {
			// Act
			const cloneItemButton = editor.page.locator( '.elementor-repeater-tool-duplicate' ).nth( 2 );
			await cloneItemButton.click();
			await editor.getPreviewFrame().locator( '.e-n-tabs .e-n-tabs .e-n-tab-title' ).nth( 3 ).waitFor();

			// Assert
			await editor.togglePreviewMode();
			await expect.soft( frame.locator( '.e-n-tabs' ).nth( 0 ) ).toHaveScreenshot( 'inner-tabs-cloned.png' );
			await editor.togglePreviewMode();
		} );

		await test.step( 'Clone Last Tab of Outer Nested Tabs', async () => {
			// Act
			const outerTabsLastTab = frame.locator( '.e-n-tabs-heading' ).nth( 0 ).locator( '.e-n-tab-title' ).nth( 2 );
			await outerTabsLastTab.click();
			const cloneItemButton = editor.page.locator( '.elementor-repeater-tool-duplicate' ).nth( 2 );
			await cloneItemButton.click();
			await editor.getPreviewFrame().locator( '.e-n-tabs' ).nth( 0 ).locator( '.e-n-tab-title' ).nth( 3 ).waitFor();

			// Assert
			await editor.togglePreviewMode();
			await expect.soft( frame.locator( '.e-n-tabs' ).nth( 0 ) ).toHaveScreenshot( 'outer-tabs-cloned.png' );
			await editor.togglePreviewMode();

			// Act
			const outerTabsFirstTab = frame.locator( '.e-n-tabs-heading' ).nth( 0 ).locator( '.e-n-tab-title' ).nth( 0 );
			await outerTabsFirstTab.click();
			const innerTabsFirstTab = frame.locator( '.e-n-tabs-content .e-n-tab-title' ).nth( 0 );
			await innerTabsFirstTab.click();

			// Assert
			await editor.togglePreviewMode();
			await expect.soft( frame.locator( '.e-n-tabs' ).nth( 0 ) ).toHaveScreenshot( 'outer-tabs-cloned-inner-tabs-check.png' );
		} );
	} );
} );
