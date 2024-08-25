import { parallelTest as test } from '../../../parallelTest';
import FloatingElementPage from './floating-element-page';
import { expect } from '@playwright/test';
import EditorSelectors from '../../../selectors/editor-selectors';

test.describe( 'Floating Elements tests', () => {
	test( 'Verify editor behavior by creating post through API', async ( {
		page,
		apiRequests,
	}, testInfo ) => {
		const floatingElPage = new FloatingElementPage( page, testInfo, apiRequests );
		const editor = await floatingElPage.createFloatingButtonWithAPI();
		await floatingElPage.waitForPanel();
		const navigatorId = '#elementor-panel-footer-navigator';
		const navigator = page.locator( navigatorId );
		// We need to check that the normal elements are not present, that the navigator is visible and the title is correct.
		await expect( navigator ).toBeHidden();
		const addButton = page.locator( '#elementor-panel-header-add-button' );
		await expect( addButton ).toBeHidden();
		const menuButton = page.locator( '#elementor-panel-header-menu-button' );
		await expect( menuButton ).toBeVisible();
		const panelTitle = page.locator( '#elementor-panel-header-title' );
		await expect( panelTitle ).toHaveText( 'Edit Single Chat' );

		// Check that we are seeing our custom advanced tab and that the normal advanced tab is hidden.
		const navigationContainer = page.locator( '.elementor-panel-navigation' );
		const buttons = navigationContainer.locator( 'button' );
		const visibleButtons = buttons.filter( { has: page.locator( ':visible' ) } );
		await expect( visibleButtons ).toHaveCount( 3 );
		const advancedSettingsCustom = page.locator( '.elementor-tab-control-advanced-tab-floating-buttons' );
		await expect( advancedSettingsCustom ).toBeVisible();
		await advancedSettingsCustom.click();

		const elementorControlsContainer = page.locator( '#elementor-controls' );
		const controlsToCheck = [
			'.elementor-control-advanced_layout_section',
			'.elementor-control-advanced_responsive_section',
			'.elementor-control-advanced_custom_controls_section',
			'.elementor-control-section_custom_css_pro',
			'.elementor-control-section_custom_attributes_pro',
		];

		controlsToCheck.forEach( async ( control ) => {
			const element = elementorControlsContainer.locator( control );
			await expect( element ).toBeVisible();
		} );

		const sections = elementorControlsContainer.locator( '.elementor-control-type-section' );
		await expect( sections ).toHaveCount( 5 );

		const addNewWidget = editor.getPreviewFrame().locator( EditorSelectors.addNewSection );
		await expect( addNewWidget ).toBeHidden();
		const container = editor.getPreviewFrame().locator( EditorSelectors.container );
		await expect( container ).toBeVisible();
		const contactButtonWidget = container.locator( EditorSelectors.getWidgetByName( 'contact-buttons' ) );
		await expect( contactButtonWidget ).toBeVisible();
		const contactButtonActionsContainer = container.locator( '.elementor-editor-container-settings' );
		const actions = contactButtonActionsContainer.locator( 'li' );
		await expect( actions ).toHaveCount( 1 );
		await contactButtonWidget.hover();
		const deleteContainer = contactButtonActionsContainer.locator( '.elementor-editor-element-remove' );
		await expect( deleteContainer ).toBeVisible();
		await deleteContainer.click();
		const libraryModal = page.locator( '#elementor-template-library-modal' );
		await expect( libraryModal ).toBeVisible();

		const closeIcon = page.locator( '.elementor-templates-modal__header__close i' );
		// Expect the title of closeIcon to be "Go To Dashboard"
		await expect( closeIcon ).toHaveAttribute( 'title', 'Go To Dashboard' );
		await closeIcon.click();
		await page.waitForURL( '/wp-admin/edit.php?post_type=e-floating-buttons' );
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
	} );
} );
