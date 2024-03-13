import { test } from '@playwright/test';
import WpAdminPage from '../../../pages/wp-admin-page';
import { addItemFromRepeater, cloneItemFromRepeater, deleteItemFromRepeater } from './helper';
import _path from 'path';

test.describe( 'Nested Tabs experiment is active @nested-atomic-repeaters', () => {
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
			container = await editor.addElement( { elType: 'container' }, 'document' ),
			nestedTabsID = await editor.addWidget( 'nested-tabs', container );

		await editor.selectElement( nestedTabsID );

		await test.step( 'Remove an item from the repeater', async () => {
			await deleteItemFromRepeater( editor, nestedTabsID );
			await page.pause();
		} );

		await test.step( 'Add an item to the repeater', async () => {
			await addItemFromRepeater( editor, nestedTabsID );
		} );

		await test.step( 'Add an item to the second accordion', async () => {
			const secondContainer = await editor.addElement( { elType: 'container' }, 'document' ),
				secondNestedTabsID = await editor.addWidget( 'nested-tabs', secondContainer );

			await editor.selectElement( secondNestedTabsID );

			await addItemFromRepeater( editor, secondNestedTabsID );
		} );
	} );

	test.only( 'Test with existing template', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.openNewPage();

		// const filePath = _path.resolve( __dirname, `./templates/nested-tabs-with-nested-tabs.json` );
		// await editor.loadTemplate( filePath, false );

		const secondContainer = await editor.addElement( { elType: 'container' }, 'document' ),
			nestedTabsID = await editor.addWidget( 'nested-tabs', secondContainer );


		await test.step( 'Clone first accordion item', async () => {
			await cloneItemFromRepeater( editor, nestedTabsID, 0 );
		} );
	} );
} );
