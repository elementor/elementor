import { parallelTest as test } from '../../../parallelTest';
import FloatingElementPage from './floating-element-page';
import { expect } from '@playwright/test';

test.describe( 'Floating Elements tests', () => {


	test( 'Verify editor behavior by creating post through API', async ( {
		page,
		apiRequests,
	}, testInfo ) => {
		const floatingElPage = new FloatingElementPage( page, testInfo, apiRequests );
		await floatingElPage.createFloatingButtonWithAPI();
	} );

	test.skip( 'Verify admin page behavior', async ( {
		page,
		apiRequests,
	}, testInfo ) => {
		const floatingElPage = new FloatingElementPage( page, testInfo, apiRequests );
		await floatingElPage.goToFloatingButtonsEmptyPage();

		const addNewButtonId = '#elementor-template-library-add-new';
		const addNewButton = page.locator( addNewButtonId );

		await test.step( 'Check that buttons and top bar exists', async () => {
			await expect( addNewButton ).toBeVisible();
			const topBar = page.locator( '#e-admin-top-bar-root' );
			await expect( topBar ).toBeVisible();
		} );

		await test.step(
			'Test flow of creating new floating element up till remote library modal. Then verify closing the modal gose back to dashboard with element created.',
			async () => {
				await addNewButton.click();
				const modal = page.locator( '#elementor-new-floating-elements-modal' );
				await expect( modal ).toBeVisible();

				const optionsField = page.locator( 'select[name="meta[_elementor_floating_elements_type]"] option' );
				await expect( optionsField ).toHaveCount( 2 );

				const hiddenField = page.locator( 'input[name="post_type"]' );
				await expect( hiddenField ).toHaveAttribute( 'value', 'e-floating-buttons' );

				const titleField = page.locator( 'input[name="post_data[post_title]"]' );
				await expect( titleField ).toBeVisible();
				await titleField.fill( 'New Floating Button' );

				const createElement = page.locator( '#elementor-new-floating-elements__form__submit' );
				await expect( createElement ).toBeVisible();
				await createElement.click();
				await page.waitForURL( /\/wp-admin\/post\.php\?post=\d+&action=elementor&floating_element=floating-buttons/ );
				const libraryModal = page.locator( '#elementor-template-library-modal' );
				await expect( libraryModal ).toBeVisible();
				const footerSelector = '.elementor-template-library-template-footer';
				const footer = page.locator( footerSelector );
				await page.hover( '.elementor-template-library-template' );
				await page.waitForSelector( footerSelector );
				await expect( footer.first() ).toBeVisible();

				const closeIcon = page.locator( '.elementor-templates-modal__header__close i' );
				// Expect the title of closeIcon to be "Go To Dashboard"
				await expect( closeIcon ).toHaveAttribute( 'title', 'Go To Dashboard' );
				await closeIcon.click();
				await page.waitForURL( '/wp-admin/edit.php?post_type=e-floating-buttons' );

				const floatingElementTitle = page.locator( '.wp-list-table tbody tr td.page-title a.row-title' );
				await expect( floatingElementTitle ).toHaveText( 'New Floating Button' );
				const floatingElementType = page.locator( '.wp-list-table tbody tr td.column-elementor_library_type a' );
				await expect( floatingElementType ).toHaveText( 'Floating Buttons' );
			} );

		await test.step(
			'Test flow of creating new floating element up till remote library modal. Then verify closing the modal gose back to dashboard with element created.',
			async () => {

			} );
	} );
} );
