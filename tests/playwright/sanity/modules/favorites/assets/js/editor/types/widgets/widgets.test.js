const { test, expect, chromium } = require( '@playwright/test' );
const { WpAdminPage } = require( '../../../../../../../../pages/wp-admin-page' );
const { EditorPage } = require( '../../../../../../../../pages/editor-page' );
const { Widgets } = require( '../../../../../../../../assets/modules/favorites/widgets' );

test.describe( 'Favorite widgets', () => {

	test.only( 'Add favorite', async ( { page } ) => {
		const wpAdmin = new WpAdminPage( page );

		await wpAdmin.login();
		await wpAdmin.setExperiments( {
			'favorite-widgets': true,
		} );
		await wpAdmin.createNewPage();

		const editor = new EditorPage( page );
		await editor.ensurePanelLoaded();

		const favoriteWidgets = new Widgets( page );
		await favoriteWidgets.add( 'Button' );
	} );
} );
