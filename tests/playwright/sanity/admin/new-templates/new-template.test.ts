import { parallelTest as test } from '../../../parallelTest';
import { expect } from '@playwright/test';
import WpAdminPage from '../../../pages/wp-admin-page';

const TEMPLATE_LIBRARY_URL = '/wp-admin/edit.php?post_type=elementor_library&tabs_group=library';
const ADD_NEW_TEMPLATE_SELECTOR = 'a.page-title-action[href*="post-new.php?post_type=elementor_library"]';
const MODAL_SELECTOR = '#elementor-new-template-modal';
const MODAL_CLOSE_SELECTOR = '.elementor-templates-modal__header__close';

test.describe( 'New Template Modal', () => {
	test( 'Opens modal when clicking Add New Template and closes when clicking close button', async ( { page, apiRequests }, testInfo ) => {
		// Arrange
		new WpAdminPage( page, testInfo, apiRequests );
		await page.goto( TEMPLATE_LIBRARY_URL );

		// Act - Click Add New Template button
		await page.click( ADD_NEW_TEMPLATE_SELECTOR );

		// Assert - Modal is visible
		const modal = page.locator( MODAL_SELECTOR );
		await expect( modal ).toBeVisible();

		// Act - Click close button
		await page.click( MODAL_CLOSE_SELECTOR );

		// Assert - Modal is closed
		await expect( modal ).not.toBeVisible();

                // Act - Click Add New Template button
                await page.click( ADD_NEW_TEMPLATE_SELECTOR );

                // Assert - Modal is visible
                await expect( modal ).toBeVisible();

                // Act - Press Escape key
                await page.keyboard.press( 'Escape' );

                // Assert - Modal is closed
                await expect( modal ).not.toBeVisible();
	} );
} );
