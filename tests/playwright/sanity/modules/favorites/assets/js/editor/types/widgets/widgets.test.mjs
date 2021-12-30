import { expect, test } from '@playwright/test'
import WpAdminPage from '../../../../../../../../pages/wp-admin-page.mjs'
import FavoriteWidgetsHelper from './helpers.mjs';
import NotificationsHelpers from '../../../../../../../assets/js/editor/utils/notifications/helpers.mjs'

test.describe( 'Favorite widgets', () => {
	test( 'Add favorite', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );

		await wpAdmin.login();
		await wpAdmin.setExperiments( {
			'favorite-widgets': true,
		} );

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

		await editor.reload();
		await editor.ensurePanelLoaded();

		await expectFavoriteVisible();

		await favoriteWidgets.remove( favoriteToAdd );

		await wpAdmin.setExperiments( {
			'favorite-widgets': false,
		} );
	} );
} );
