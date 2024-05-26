import { test, expect } from '@playwright/test';
import WpAdminPage from '../../../../../../../../pages/wp-admin-page';
import FavoriteWidgetsHelper from './helpers';
import NotificationsHelpers from '../../../../../../../assets/js/editor/utils/notifications/helpers';

test.describe( 'Favorite widgets', () => {
	test( 'Add favorite', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );

		const editor = await wpAdmin.openNewPage();

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
		await editor.waitForPanelToLoad();

		await expectFavoriteVisible();

		await favoriteWidgets.remove( favoriteToAdd );
	} );
} );
