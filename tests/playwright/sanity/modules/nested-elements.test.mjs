import { test, expect } from '@playwright/test'
import WpAdminPage from "../../pages/wp-admin-page.mjs";

/**
 * @type {EditorPage}
 */
let editor;

test.describe( 'NestedElementsModule', () => {
	test.beforeEach( async ( { page }, testInfo) => {
		const wpAdmin = new WpAdminPage( page, testInfo );

		await wpAdmin.login();

		await wpAdmin.setExperiments( {
			container: true,
			'nested-elements': true,
		} );

		editor = await wpAdmin.useElementorCleanPost();
	} );

	test.describe( 'Component: `nested-elements`', () => {
		test.describe( 'Component: `nested-elements/nested-repeater`', () => {

			test.describe( 'Commands', () => {
				test( 'Command: `nested-elements/nested-repeater/select`', async () => {
					// Arrange.
					const indexToSelect = 2,
						eNestedTabsId = await editor.addWidget( 'nested-tabs' ),
						elWidget = await editor.getElementHandle( eNestedTabsId );

					// By default there two tabs, and the first selected, select the second tab.
					// Act.
					await editor.page.evaluate( ( [ id, index ] ) => {
						return $e.commands.run( 'nested-elements/nested-repeater/select', {
							index,
							container: elementor.getContainer( id ) }
						);
					}, [ eNestedTabsId, indexToSelect ] );

					// TODO: WIP.

				} );
			} );

			test.describe( 'Hooks', () => {

				test.describe( 'Data', () => {
				} );

				test.describe( 'UI', () => {
				} );
			} );
		} );
	} );
} );
