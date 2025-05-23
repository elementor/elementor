const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../../../../../../pages/wp-admin-page' );
const FavoriteWidgetsHelper = require( './helpers' );
const NotificationsHelpers = require( '../../../../../../../assets/js/editor/utils/notifications/helpers' );

test.describe( 'Favorite widgets', () => {
	test( 'Add favorite', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );

		const editor = await wpAdmin.useElementorCleanPost();

		const favoriteToAdd = 'Button';

		const favoriteWidgets = new FavoriteWidgetsHelper( page );
		await favoriteWidgets.add( favoriteToAdd );

		const expectFavoriteVisible = async () => {
			await expect( page.locator( `#elementor-panel-category-favorites >> text="${ favoriteToAdd }"` ) )
				.toBeVisible();
		};

		// Validate that an indication toast appears
		const notifications = new NotificationsHelpers( page );
		await notifications.waitForToast( 'Added' );

		await expectFavoriteVisible();

		await page.waitForTimeout( 1000 );

		await page.reload();
		await editor.ensurePanelLoaded();

		await expectFavoriteVisible();

		await favoriteWidgets.remove( favoriteToAdd );
	} );
} );
